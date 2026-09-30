"""Inspect USER containers with RSZ v16 metadata, without guessing field layouts.

Format reference: alphazolam/RE_RSZ @ 871a1d5c4c7b81c60c966d73ee63f4c4413ab56e.
See docs/THIRD_PARTY_NOTICES.md. Returned offsets are absolute file offsets.
"""

import argparse
import hashlib
import itertools
import json
import struct
import sys
from datetime import UTC, datetime
from pathlib import Path

MAX_BYTES = 16 * 1024 * 1024
MAX_COUNT = 100_000
USER_HEADER = struct.Struct("<4siiiQQQ")
RSZ_HEADER = struct.Struct("<4sIiiiiqqq")


class UserFormatError(ValueError):
    """Unsupported or inconsistent USER/RSZ metadata."""


def _span(offset: int, size: int, lower: int, upper: int) -> None:
    if offset < lower or size < 0 or offset + size > upper:
        raise UserFormatError(f"Invalid region at {offset}, size {size}, bounds {lower}..{upper}.")


def _utf16(data: bytes, offset: int, lower: int, upper: int) -> str:
    _span(offset, 2, lower, upper)
    if offset % 2:
        raise UserFormatError("Unaligned UTF-16 string offset.")
    end = offset
    while end + 2 <= upper and end - offset <= 8192:
        if data[end : end + 2] == b"\0\0":
            try:
                return data[offset:end].decode("utf-16le")
            except UnicodeDecodeError as exc:
                raise UserFormatError("Invalid UTF-16 string.") from exc
        end += 2
    raise UserFormatError("Unterminated or oversized UTF-16 string.")


def parse_user(data: bytes) -> dict:
    """Read bounded reference tables and type IDs; leave instance values opaque."""
    if len(data) > MAX_BYTES:
        raise UserFormatError("USER file exceeds the 16 MiB limit.")
    _span(0, USER_HEADER.size, 0, len(data))
    magic, resource_count, userdata_count, info_count, resource_at, userdata_at, rsz_at = (
        USER_HEADER.unpack_from(data)
    )
    if magic != b"USR\0" or info_count != 0:
        raise UserFormatError("Unsupported USER magic or nonzero InfoCount.")
    if not all(0 <= count <= MAX_COUNT for count in (resource_count, userdata_count)):
        raise UserFormatError("Invalid USER table count.")
    _span(rsz_at, RSZ_HEADER.size, USER_HEADER.size, len(data))
    _span(resource_at, resource_count * 8, USER_HEADER.size, rsz_at)
    _span(userdata_at, userdata_count * 16, resource_at + resource_count * 8, rsz_at)
    strings_at = userdata_at + userdata_count * 16
    crc_offsets = []
    resources = []
    for index in range(resource_count):
        offset = struct.unpack_from("<Q", data, resource_at + index * 8)[0]
        resources.append({"path": _utf16(data, offset, strings_at, rsz_at), "offset": offset})
    userdatas = []
    for index in range(userdata_count):
        table_at = userdata_at + index * 16
        type_id, crc, offset = struct.unpack_from("<IIQ", data, table_at)
        crc_offsets.append(table_at + 4)
        userdatas.append(
            {
                "type_id": f"{type_id:08x}",
                "crc": f"{crc:08x}",
                "path": _utf16(data, offset, strings_at, rsz_at),
                "offset": offset,
            }
        )
    (
        rsz_magic,
        version,
        object_count,
        instance_count,
        rsz_userdata_count,
        reserved,
        instance_relative,
        data_relative,
        userdata_relative,
    ) = RSZ_HEADER.unpack_from(data, rsz_at)
    if rsz_magic != b"RSZ\0" or version != 16 or reserved != 0:
        raise UserFormatError("Unsupported RSZ header/version/reserved field.")
    if not all(
        0 <= count <= MAX_COUNT for count in (object_count, instance_count, rsz_userdata_count)
    ):
        raise UserFormatError("Invalid RSZ table count.")
    if instance_count == 0:
        raise UserFormatError("Missing RSZ NULL instance.")
    objects_at = rsz_at + RSZ_HEADER.size
    instance_at = rsz_at + instance_relative
    data_at = rsz_at + data_relative
    rsz_userdata_at = rsz_at + userdata_relative
    _span(objects_at, object_count * 4, objects_at, len(data))
    _span(instance_at, instance_count * 8, objects_at + object_count * 4, len(data))
    _span(rsz_userdata_at, rsz_userdata_count * 16, instance_at + instance_count * 8, len(data))
    _span(data_at, 0, rsz_userdata_at + rsz_userdata_count * 16, len(data))
    objects = [
        struct.unpack_from("<i", data, objects_at + index * 4)[0] for index in range(object_count)
    ]
    if any(index < 0 or index >= instance_count for index in objects):
        raise UserFormatError("Object table references an invalid instance.")
    instances = []
    for index in range(instance_count):
        table_at = instance_at + index * 8
        type_id, crc = struct.unpack_from("<II", data, table_at)
        crc_offsets.append(table_at + 4)
        instances.append({"index": index, "type_id": f"{type_id:08x}", "crc": f"{crc:08x}"})
    if instances[0]["type_id"] != "00000000" or instances[0]["crc"] != "00000000":
        raise UserFormatError("Nonzero RSZ NULL instance.")
    rsz_userdatas = []
    for index in range(rsz_userdata_count):
        table_at = rsz_userdata_at + index * 16
        instance_id, type_id, relative = struct.unpack_from("<IIQ", data, table_at)
        if not 0 < instance_id < instance_count:
            raise UserFormatError("RSZ userdata references an invalid instance.")
        if instances[instance_id]["type_id"] != f"{type_id:08x}":
            raise UserFormatError("RSZ userdata type disagrees with its instance.")
        offset = rsz_at + relative
        rsz_userdatas.append(
            {
                "instance_id": instance_id,
                "type_id": f"{type_id:08x}",
                "path": _utf16(data, offset, rsz_userdata_at + rsz_userdata_count * 16, data_at),
                "offset": offset,
            }
        )
    return {
        "file_bytes": len(data),
        "content_sha256": hashlib.sha256(data).hexdigest(),
        "user": {"info_count": info_count, "resources": resources, "userdata": userdatas},
        "rsz": {
            "offset": rsz_at,
            "version": version,
            "object_table": objects,
            "instances": instances,
            "userdata": rsz_userdatas,
            "instance_data_offset": data_at,
            "instance_data_bytes": len(data) - data_at,
            "instance_data_sha256": hashlib.sha256(data[data_at:]).hexdigest(),
        },
        "crc_field_offsets": crc_offsets,
    }


def compare_users(left: bytes, right: bytes) -> dict:
    a, b = parse_user(left), parse_user(right)
    crc_slots = {
        offset + byte
        for offset in set(a["crc_field_offsets"]) & set(b["crc_field_offsets"])
        for byte in range(4)
    }
    changed = [index for index, (x, y) in enumerate(zip(left, right, strict=False)) if x != y]
    a_paths = {item["path"] for item in a["user"]["userdata"]}
    b_paths = {item["path"] for item in b["user"]["userdata"]}
    return {
        "byte_identical": left == right,
        "different_byte_count": len(changed) + abs(len(left) - len(right)),
        "differences_only_in_crc_fields": bool(changed)
        and len(left) == len(right)
        and set(changed) <= crc_slots,
        "instance_type_ids_equal": [item["type_id"] for item in a["rsz"]["instances"]]
        == [item["type_id"] for item in b["rsz"]["instances"]],
        "instance_data_equal": left[a["rsz"]["instance_data_offset"] :]
        == right[b["rsz"]["instance_data_offset"] :],
        "resource_paths_equal": [item["path"] for item in a["user"]["resources"]]
        == [item["path"] for item in b["user"]["resources"]],
        "userdata_paths_removed": sorted(a_paths - b_paths),
        "userdata_paths_added": sorted(b_paths - a_paths),
    }


def inspect_extraction(manifest_path: Path) -> dict:
    with manifest_path.open("rb") as handle:
        raw_manifest = handle.read(MAX_BYTES + 1)
    if len(raw_manifest) > MAX_BYTES:
        raise ValueError("Extraction manifest exceeds the size limit.")
    manifest = json.loads(raw_manifest)
    if manifest["schema_version"] != 1:
        raise ValueError("Unsupported extraction manifest version.")
    if not isinstance(manifest["occurrences"], list) or not 1 <= len(manifest["occurrences"]) <= 64:
        raise ValueError("Select between 1 and 64 extracted occurrences for inspection.")
    source_directory = str(Path(manifest["source_directory"]).resolve())
    root = manifest_path.resolve().parent
    records, comparisons = [], []
    contents: dict[str, list[tuple[str, bytes]]] = {}
    total = 0
    for occurrence in manifest["occurrences"]:
        path = (root / occurrence["output_file"]).resolve()
        if path.parent != root:
            raise ValueError("Extracted file resolves outside the extraction directory.")
        with path.open("rb") as handle:
            data = handle.read(MAX_BYTES + 1)
        total += len(data)
        if total > 64 * 1024 * 1024:
            raise ValueError("Extraction exceeds the total inspection limit.")
        if hashlib.sha256(data).hexdigest() != occurrence["content_sha256"]:
            raise ValueError("Extracted file digest disagrees with its manifest.")
        metadata = parse_user(data)
        records.append(
            {
                "candidate_path": occurrence["candidate_path"],
                "archive": occurrence["archive"],
                "file": str(path),
                **metadata,
            }
        )
        contents.setdefault(occurrence["candidate_path"], []).append((occurrence["archive"], data))
    for candidate, versions in contents.items():
        for (left_name, left), (right_name, right) in itertools.combinations(versions, 2):
            comparisons.append(
                {
                    "candidate_path": candidate,
                    "left": left_name,
                    "right": right_name,
                    **compare_users(left, right),
                }
            )
    return {
        "schema_version": 1,
        "observed_utc": datetime.now(UTC).isoformat(),
        "source_directory": source_directory,
        "extraction_manifest": str(manifest_path.resolve()),
        "extraction_manifest_sha256": hashlib.sha256(raw_manifest).hexdigest(),
        "files": records,
        "comparisons": comparisons,
        "limitations": [
            "Only USER reference tables and RSZ v16 instance metadata are decoded.",
            "Instance field values, UI semantics and effective patch priority are not inferred.",
            "Type IDs require an independently sourced type database and CRC validation.",
        ],
    }


def annotate_types(report: dict, database_path: Path) -> None:
    """Attach sourced type names and decode only when every instance CRC matches."""
    from mhwa.rsz_fields import decode_fields

    with database_path.open("rb") as handle:
        raw_database = handle.read(128 * 1024 * 1024 + 1)
    if len(raw_database) > 128 * 1024 * 1024:
        raise ValueError("Type database exceeds the 128 MiB limit.")
    database = json.loads(raw_database)
    if not isinstance(database, dict):
        raise ValueError("Type database must be a JSON object.")
    report["type_database"] = {
        "path": str(database_path.resolve()),
        "bytes": len(raw_database),
        "sha256": hashlib.sha256(raw_database).hexdigest(),
        "metadata": database.get("metadata"),
    }
    for record in report["files"]:
        annotations = []
        for instance in record["rsz"]["instances"]:
            definition = database.get(format(int(instance["type_id"], 16), "x"))
            if definition is not None and not isinstance(definition, dict):
                raise ValueError("Type database definitions must be JSON objects.")
            expected_crc = int(definition["crc"], 16) if definition else None
            annotations.append(
                {
                    **instance,
                    "type_name_candidate": definition["name"] if definition else None,
                    "database_crc": f"{expected_crc:08x}" if expected_crc is not None else None,
                    "schema_crc_matches": expected_crc == int(instance["crc"], 16),
                }
            )
        record["type_annotations"] = annotations
        if not all(item["schema_crc_matches"] for item in annotations):
            record["fields_status"] = "not_decoded"
            record["fields_reason"] = "Missing type definition or mismatching instance CRC."
            continue
        with Path(record["file"]).open("rb") as handle:
            data = handle.read(MAX_BYTES + 1)
        if hashlib.sha256(data).hexdigest() != record["content_sha256"]:
            raise ValueError("Extracted file changed before typed decoding.")
        try:
            fields = decode_fields(data, database)
        except ValueError as exc:
            record["fields_status"] = "not_decoded"
            record["fields_reason"] = str(exc)
        else:
            record["fields_status"] = "decoded"
            record["decoded_fields"] = fields
    report["limitations"] = [
        "Type names come from the supplied database; a matching ID alone does not validate layout.",
        "Typed fields are decoded only with matching CRCs and a fully consumed supported layout.",
        "External userdata paths are references; their contents are not loaded by this inspector.",
        "UI labels/ranges, character save values and effective patch priority remain unverified.",
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--extraction", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--type-database", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.output.resolve().is_relative_to(args.extraction.resolve().parent):
            raise ValueError("Inspection report must be outside the extraction directory.")
        if args.output.exists():
            raise FileExistsError("Inspection output already exists.")
        report = inspect_extraction(args.extraction)
        if args.type_database:
            annotate_types(report, args.type_database)
        if args.output.resolve().is_relative_to(Path(report["source_directory"])):
            raise ValueError("Inspection report must be outside the game tree.")
        with args.output.open("x", encoding="utf-8", newline="\n") as handle:
            json.dump(report, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"USER inspection failed: {exc}", file=sys.stderr)
        return 1
    print(f"Inspected {len(report['files'])} USER files; report: {args.output}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
