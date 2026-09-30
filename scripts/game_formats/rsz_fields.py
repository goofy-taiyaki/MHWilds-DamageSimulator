"""Decode a bounded subset of USER/RSZ v16 fields after type-ID/CRC checks.

The binary contracts were checked against MIT-licensed REE-Lib, fixed commit
bf0e5e5222700716516797613a54b9b61fedfc35:
REE-Lib/RszFile/RszInstance.cs, RSZFile.cs, and REE-Lib/FileHandler.cs.
See docs/THIRD_PARTY_NOTICES.md. This module does not infer field types,
follow external files, expand references, or claim UI meanings.
"""

import math
import re
import struct
import uuid
from dataclasses import dataclass

from .user_container import parse_user

MAX_ARRAY_COUNT = 100_000
MAX_STRING_UNITS = 8192
MAX_FIELDS_PER_TYPE = 4096
MAX_FIELD_RECORDS = 250_000
MAX_VALUES = 1_000_000

# Only layouts required by the inspected candidates are accepted.
_LAYOUTS = {
    "U32": (4, 4),
    "S32": (4, 4),
    "Object": (4, 4),
    "UserData": (4, 4),
    "Guid": (8, 16),
    "Vec3": (16, 16),
    "F32": (4, 4),
    "Bool": (1, 1),
    "Resource": (4, 4),
}
_HEX32 = re.compile(r"[0-9a-fA-F]{1,8}")


class RszFieldError(ValueError):
    """An unsupported layout, mismatching type definition, or malformed value."""


def _type_entry(database: dict, type_id: str, crc: str, index: int) -> dict:
    keys = (format(int(type_id, 16), "x"), type_id)
    matches = [database[key] for key in dict.fromkeys(keys) if key in database]
    if not matches:
        raise RszFieldError(f"Instance {index}: type ID {type_id} is missing from database.")
    entry = matches[0]
    if any(match != entry for match in matches[1:]):
        raise RszFieldError(f"Instance {index}: ambiguous database keys for type {type_id}.")
    if not isinstance(entry, dict):
        raise RszFieldError(f"Instance {index}: invalid definition for type {type_id}.")
    expected = entry.get("crc")
    if not isinstance(expected, str) or not _HEX32.fullmatch(expected):
        raise RszFieldError(f"Instance {index}: invalid database CRC for type {type_id}.")
    if int(expected, 16) != int(crc, 16):
        raise RszFieldError(
            f"Instance {index}: CRC mismatch for {type_id}: file {crc}, database {expected}."
        )
    if not isinstance(entry.get("name"), str) or not entry["name"]:
        raise RszFieldError(f"Instance {index}: database type name is missing.")
    if not isinstance(entry.get("fields"), list):
        raise RszFieldError(f"Instance {index}: database fields must be an ordered list.")
    return entry


def _validate_fields(entry: dict) -> list[dict]:
    fields = entry["fields"]
    if len(fields) > MAX_FIELDS_PER_TYPE:
        raise RszFieldError(f"Type {entry['name']}: too many field definitions.")
    for field in fields:
        if not isinstance(field, dict):
            raise RszFieldError(f"Type {entry['name']}: invalid field definition.")
        name = field.get("name")
        if not isinstance(name, str) or not name:
            raise RszFieldError(f"Type {entry['name']}: missing field name.")
        kind = field.get("type")
        if not isinstance(kind, str) or kind not in _LAYOUTS:
            raise RszFieldError(f"Type {entry['name']}, field {name}: unsupported type {kind!r}.")
        if type(field.get("array")) is not bool:
            raise RszFieldError(f"Type {entry['name']}, field {name}: array must be boolean.")
        align, size = field.get("align"), field.get("size")
        if type(align) is not int or type(size) is not int:
            raise RszFieldError(f"Type {entry['name']}, field {name}: invalid alignment or size.")
        if (align, size) != _LAYOUTS[kind]:
            raise RszFieldError(
                f"Type {entry['name']}, field {name}: unsupported {kind} "
                f"alignment/size {align}/{size}."
            )
        original = field.get("original_type")
        if original is not None and not isinstance(original, str):
            raise RszFieldError(f"Type {entry['name']}, field {name}: invalid original_type.")
    return fields


@dataclass
class _Reader:
    data: bytes
    position: int
    instance_count: int
    value_count: int = 0

    def take(self, size: int) -> bytes:
        end = self.position + size
        if size < 0 or end > len(self.data):
            raise RszFieldError(
                f"Truncated field at offset {self.position}, requesting {size} bytes."
            )
        raw = self.data[self.position : end]
        self.position = end
        return raw

    def align(self, alignment: int) -> None:
        # REE-Lib aligns Stream.Position, i.e. absolute file positions.
        target = (self.position + alignment - 1) // alignment * alignment
        self.take(target - self.position)

    def integer(self, signed: bool = True) -> int:
        return struct.unpack("<i" if signed else "<I", self.take(4))[0]

    def value(self, kind: str):
        self.value_count += 1
        if self.value_count > MAX_VALUES:
            raise RszFieldError("Decoded value count exceeds the limit.")
        if kind == "U32":
            return self.integer(signed=False)
        if kind == "S32":
            return self.integer()
        if kind in ("Object", "UserData"):
            index = self.integer()
            if not 0 <= index < self.instance_count:
                raise RszFieldError(f"Invalid {kind} instance reference {index}.")
            return {"instance_index": index}
        if kind == "Bool":
            value = self.take(1)[0]
            if value not in (0, 1):
                raise RszFieldError(f"Unsupported noncanonical Bool byte {value}.")
            return bool(value)
        if kind == "F32":
            value = struct.unpack("<f", self.take(4))[0]
            if not math.isfinite(value):
                raise RszFieldError("Nonfinite F32 cannot be represented as a numeric JSON value.")
            return value
        if kind == "Guid":
            return str(uuid.UUID(bytes_le=self.take(16)))
        if kind == "Vec3":
            raw = self.take(16)
            xyz = list(struct.unpack("<3f", raw[:12]))
            if not all(math.isfinite(value) for value in xyz):
                raise RszFieldError("Nonfinite Vec3 component.")
            # The reference reads Vector3 (12 bytes), then advances by field.size.
            return {"xyz": xyz, "padding_hex": raw[12:].hex()}
        if kind == "Resource":
            count = self.integer()
            if not 0 <= count <= MAX_STRING_UNITS:
                raise RszFieldError(f"Invalid or oversized Resource UTF-16 length {count}.")
            if count == 0:
                return ""
            raw = self.take(count * 2)
            if raw[-2:] != b"\0\0":
                raise RszFieldError("Resource UTF-16 length does not include a NUL terminator.")
            try:
                value = raw[:-2].decode("utf-16le")
            except UnicodeDecodeError as exc:
                raise RszFieldError("Invalid Resource UTF-16 text.") from exc
            if "\0" in value:
                raise RszFieldError("Resource contains an embedded NUL before its declared end.")
            return value
        raise RszFieldError(f"Unsupported field type {kind!r}.")

    def field(self, definition: dict) -> dict:
        kind = definition["type"]
        is_array = definition["array"]
        self.align(4 if is_array else definition["align"])
        offset = self.position
        if is_array:
            count = self.integer()
            if not 0 <= count <= MAX_ARRAY_COUNT:
                raise RszFieldError(f"Invalid or oversized array count {count}.")
            if self.value_count + count > MAX_VALUES:
                raise RszFieldError("Decoded value count exceeds the limit.")
            values = []
            if count:
                self.align(definition["align"])
            for _ in range(count):
                if kind == "Resource":
                    self.align(4)
                values.append(self.value(kind))
            value = values
        else:
            value = self.value(kind)
        return {
            "name": definition["name"],
            "type": kind,
            "original_type": definition.get("original_type"),
            "array": is_array,
            "offset": offset,
            "byte_length": self.position - offset,
            "value": value,
        }


def decode_fields(data: bytes, database: dict) -> dict:
    """Return a fully consumed instance graph, or raise ValueError without a result.

    Offsets refer to absolute file positions. Object/UserData values retain integer
    instance references; an external node records its path without opening it.
    CRCs are checked for every non-NULL instance, including external nodes.
    Only inline fields need a supported layout. An unparsed trailing byte fails.
    """
    if not isinstance(data, bytes) or not isinstance(database, dict):
        raise RszFieldError("decode_fields requires bytes and a type database dict.")
    container = parse_user(data)
    rsz = container["rsz"]
    instances = rsz["instances"]
    external = {}
    for item in rsz["userdata"]:
        index = item["instance_id"]
        if index in external:
            raise RszFieldError(f"Duplicate external userdata entry for instance {index}.")
        external[index] = item["path"]

    # Complete preflight before consuming any inline fields.
    prepared = []
    cached_fields = {}
    total_fields = 0
    validated = 0
    for instance in instances:
        index, type_id, crc = instance["index"], instance["type_id"], instance["crc"]
        if type_id == "00000000":
            if crc != "00000000":
                raise RszFieldError(f"Instance {index}: nonzero NULL CRC.")
            prepared.append((instance, None, []))
            continue
        entry = _type_entry(database, type_id, crc, index)
        validated += 1
        fields = []
        if index not in external:
            if type_id not in cached_fields:
                cached_fields[type_id] = _validate_fields(entry)
            fields = cached_fields[type_id]
            total_fields += len(fields)
            if total_fields > MAX_FIELD_RECORDS:
                raise RszFieldError("Inline field record count exceeds the limit.")
        prepared.append((instance, entry, fields))

    reader = _Reader(data, rsz["instance_data_offset"], len(instances))
    nodes = []
    for instance, entry, fields in prepared:
        index = instance["index"]
        path = external.get(index)
        start = reader.position
        records = []
        if entry is not None and index not in external:
            for definition in fields:
                try:
                    records.append(reader.field(definition))
                except ValueError as exc:
                    raise RszFieldError(
                        f"Instance {index} ({entry['name']}), field {definition['name']}: {exc}"
                    ) from exc
        nodes.append(
            {
                **instance,
                "type_name": entry["name"] if entry is not None else None,
                "external_path": path,
                "fields": records,
                "data_offset": start if entry is not None and index not in external else None,
                "data_bytes": reader.position - start,
            }
        )
    if reader.position != len(data):
        raise RszFieldError(
            f"Unconsumed trailing instance data: {len(data) - reader.position} bytes "
            f"at offset {reader.position}."
        )
    return {
        "schema_version": 1,
        "fully_consumed": True,
        "content_sha256": container["content_sha256"],
        "instance_data_offset": rsz["instance_data_offset"],
        "instance_data_bytes": rsz["instance_data_bytes"],
        "consumed_instance_data_bytes": reader.position - rsz["instance_data_offset"],
        "crc_validated_instance_count": validated,
        "roots": [
            {"object_index": object_index, "instance_index": instance_index}
            for object_index, instance_index in enumerate(rsz["object_table"])
        ],
        "nodes": nodes,
    }

