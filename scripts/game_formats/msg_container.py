"""Read bounded RE Engine MSG v23 entries and their language IDs.

Format references (MIT):
kagenocookie/RE-Engine-Lib @ bf0e5e5222700716516797613a54b9b61fedfc35,
REE-Lib/OtherFiles/MsgFile.cs; and seifhassine/REasy
@ 2d1324dcae003d04878ab01ad33f80566eeef201, file_handlers/msg/msg_handler.py.
See docs/THIRD_PARTY_NOTICES.md. Strings are asset values, not verified live UI.
"""

import hashlib
import math
import struct
import uuid
from dataclasses import dataclass, field

MAX_BYTES = 16 * 1024 * 1024
MAX_ENTRIES = 100_000
MAX_LANGUAGES = 64
MAX_ATTRIBUTES = 64
MAX_CELLS = 1_000_000
MAX_STRING_UNITS = 65_536
MAX_TOTAL_TEXT_UNITS = 8 * 1024 * 1024

HEADER = struct.Struct("<I4sQIIIIQQQQQ")
ENTRY = struct.Struct("<16sIIQQ")
_KEY = bytes.fromhex("cf ce fb f8 ec 0a 33 66 93 a9 1d 93 50 39 5f 09")
_LANGUAGE_NAMES = (
    "Japanese",
    "English",
    "French",
    "Italian",
    "German",
    "Spanish",
    "Russian",
    "Polish",
    "Dutch",
    "Portuguese",
    "PortugueseBr",
    "Korean",
    "TraditionalChinese",
    "SimplifiedChinese",
    "Finnish",
    "Swedish",
    "Danish",
    "Norwegian",
    "Czech",
    "Hungarian",
    "Slovak",
    "Arabic",
    "Turkish",
    "Bulgarian",
    "Greek",
    "Romanian",
    "Thai",
    "Ukrainian",
    "Vietnamese",
    "Indonesian",
    "Fiction",
    "Hindi",
    "LatinAmericanSpanish",
)
_ATTRIBUTE_NAMES = {-1: "Empty", 0: "Long", 1: "Double", 2: "String"}


class MsgFormatError(ValueError):
    """Unsupported MSG metadata or a malformed referenced value."""


def _span(offset: int, size: int, lower: int, upper: int, label: str) -> None:
    if offset < lower or size < 0 or offset + size > upper:
        raise MsgFormatError(
            f"{label}: invalid region at {offset}, size {size}, bounds {lower}..{upper}."
        )


def _region(
    regions: list[tuple[int, int, str]],
    offset: int,
    size: int,
    pool_at: int,
    label: str,
) -> None:
    if size:
        _span(offset, size, HEADER.size, pool_at, label)
        regions.append((offset, offset + size, label))
    else:
        # Empty tables can use a zero pointer; still reject out-of-file metadata.
        _span(offset, 0, 0, pool_at, label)


def _check_regions(regions: list[tuple[int, int, str]]) -> None:
    previous = None
    # Repeated pointers to precisely the same kind of record retain their aliases.
    for current in sorted(set(regions)):
        if previous is not None and current[0] < previous[1]:
            raise MsgFormatError(f"Overlapping metadata regions: {previous[2]} and {current[2]}.")
        previous = current


def _decrypt_pool(encrypted: bytes) -> bytes:
    output = bytearray(len(encrypted))
    previous_cipher = 0
    for index, current_cipher in enumerate(encrypted):
        output[index] = current_cipher ^ previous_cipher ^ _KEY[index % len(_KEY)]
        previous_cipher = current_cipher
    return bytes(output)


@dataclass
class _Strings:
    pool: bytes
    base: int
    used_units: int = 0
    cache: dict[int, tuple[str, int]] = field(default_factory=dict)

    def read(self, offset: int, label: str) -> str:
        if offset == 0:
            return ""
        _span(offset, 2, self.base, self.base + len(self.pool), label)
        if offset % 2:
            raise MsgFormatError(f"{label}: unaligned UTF-16 string offset {offset}.")
        if offset not in self.cache:
            start = offset - self.base
            limit = min(len(self.pool), start + (MAX_STRING_UNITS + 1) * 2)
            for end in range(start, limit - 1, 2):
                if self.pool[end : end + 2] == b"\0\0":
                    try:
                        text = self.pool[start:end].decode("utf-16le")
                    except UnicodeDecodeError as exc:
                        raise MsgFormatError(f"{label}: invalid UTF-16 text.") from exc
                    self.cache[offset] = (text, (end - start) // 2)
                    break
            else:
                raise MsgFormatError(f"{label}: unterminated or oversized UTF-16 string.")
        text, units = self.cache[offset]
        self.used_units += units
        if self.used_units > MAX_TOTAL_TEXT_UNITS:
            raise MsgFormatError("Expanded message text exceeds the output limit.")
        return text


def parse_msg(data: bytes) -> dict:
    """Decode MSG v23 into entries, language columns and attributes.

    All pointers are absolute file offsets. Language columns retain both their
    table position and numeric language ID: Japanese is ID 0, not necessarily
    column 0. No entries are collapsed by name or GUID. Unknown language IDs
    retain a null name and can repeat without losing column positions. Nonzero
    string pointers must address the encrypted pool.
    """
    if not isinstance(data, bytes):
        raise MsgFormatError("parse_msg requires immutable bytes.")
    if len(data) > MAX_BYTES:
        raise MsgFormatError("MSG file exceeds the 16 MiB input limit.")
    _span(0, HEADER.size, 0, len(data), "MSG header")
    (
        version,
        magic,
        header_offset,
        entry_count,
        attribute_count,
        language_count,
        padding,
        pool_at,
        unknown_at,
        language_at,
        attribute_type_at,
        attribute_name_at,
    ) = HEADER.unpack_from(data)
    if version != 23 or magic != b"GMSG":
        raise MsgFormatError("Unsupported MSG version or magic; only v23 is accepted.")
    if header_offset != 16 or padding != 0:
        raise MsgFormatError("Unsupported MSG header offset or nonzero padding.")
    if (
        entry_count > MAX_ENTRIES
        or attribute_count > MAX_ATTRIBUTES
        or language_count > MAX_LANGUAGES
    ):
        raise MsgFormatError("MSG table count exceeds the supported limit.")
    if entry_count * (language_count + attribute_count) > MAX_CELLS:
        raise MsgFormatError("MSG language/attribute cell count exceeds the limit.")
    _span(pool_at, 0, HEADER.size, len(data), "Encrypted string pool")
    if pool_at % 2 or (len(data) - pool_at) % 2:
        raise MsgFormatError("Encrypted UTF-16 pool has an odd offset or byte length.")

    regions = [(0, HEADER.size, "header")]
    _region(regions, HEADER.size, entry_count * 8, pool_at, "entry offset table")
    _region(regions, language_at, language_count * 4, pool_at, "language ID table")
    _region(regions, attribute_type_at, attribute_count * 4, pool_at, "attribute type table")
    _region(regions, attribute_name_at, attribute_count * 8, pool_at, "attribute name table")
    unknown_data = None
    if unknown_at:
        _region(regions, unknown_at, 8, pool_at, "unknown data")
        unknown_data = data[unknown_at : unknown_at + 8].hex()
    _check_regions(regions)

    language_ids = [
        struct.unpack_from("<I", data, language_at + index * 4)[0]
        for index in range(language_count)
    ]
    duplicate_language_ids = sorted(
        {language_id for language_id in language_ids if language_ids.count(language_id) > 1}
    )
    if any(language_id < len(_LANGUAGE_NAMES) for language_id in duplicate_language_ids):
        raise MsgFormatError("Duplicate known language IDs make the language columns ambiguous.")
    attribute_types = [
        struct.unpack_from("<i", data, attribute_type_at + index * 4)[0]
        for index in range(attribute_count)
    ]
    for type_id in attribute_types:
        if type_id not in _ATTRIBUTE_NAMES:
            raise MsgFormatError(f"Unsupported MSG attribute type {type_id}.")
    attribute_name_offsets = [
        struct.unpack_from("<Q", data, attribute_name_at + index * 8)[0]
        for index in range(attribute_count)
    ]

    entry_rows = []
    for index in range(entry_count):
        offset = struct.unpack_from("<Q", data, HEADER.size + index * 8)[0]
        _region(regions, offset, ENTRY.size + language_count * 8, pool_at, "entry header")
        guid_bytes, sound_id, name_hash, name_at, attributes_at = ENTRY.unpack_from(data, offset)
        _region(regions, attributes_at, attribute_count * 8, pool_at, "entry attribute values")
        content_offsets = [
            struct.unpack_from("<Q", data, offset + ENTRY.size + column * 8)[0]
            for column in range(language_count)
        ]
        entry_rows.append(
            (offset, guid_bytes, sound_id, name_hash, name_at, attributes_at, content_offsets)
        )
    _check_regions(regions)

    pool = _decrypt_pool(data[pool_at:])
    strings = _Strings(pool, pool_at)
    definitions = [
        {
            "index": index,
            "name": strings.read(attribute_name_offsets[index], f"Attribute {index} name"),
            "type_id": type_id,
            "type_name": _ATTRIBUTE_NAMES[type_id],
            "name_offset": attribute_name_offsets[index],
        }
        for index, type_id in enumerate(attribute_types)
    ]
    languages = [
        {
            "index": index,
            "id": language_id,
            "name": (_LANGUAGE_NAMES[language_id] if language_id < len(_LANGUAGE_NAMES) else None),
        }
        for index, language_id in enumerate(language_ids)
    ]

    entries = []
    for index, row in enumerate(entry_rows):
        offset, guid_bytes, sound_id, name_hash, name_at, attributes_at, content_offsets = row
        attributes = []
        for attribute in definitions:
            type_id = attribute["type_id"]
            cell_at = attributes_at + attribute["index"] * 8
            if type_id in (-1, 2):
                string_at = struct.unpack_from("<Q", data, cell_at)[0]
                value = strings.read(string_at, f"Entry {index} attribute {attribute['index']}")
            elif type_id == 0:
                value = struct.unpack_from("<q", data, cell_at)[0]
            else:
                value = struct.unpack_from("<d", data, cell_at)[0]
                if not math.isfinite(value):
                    raise MsgFormatError(f"Entry {index}: nonfinite Double attribute.")
            attributes.append(
                {
                    "index": attribute["index"],
                    "name": attribute["name"],
                    "type_id": type_id,
                    "offset": cell_at,
                    "value": value,
                }
            )
        entries.append(
            {
                "index": index,
                "offset": offset,
                "guid": str(uuid.UUID(bytes_le=guid_bytes)),
                "name": strings.read(name_at, f"Entry {index} name"),
                "name_offset": name_at,
                "name_hash": name_hash,
                "sound_id": sound_id,
                "attributes": attributes,
                "messages": [
                    {
                        "language_index": column,
                        "language_id": language_ids[column],
                        "offset": text_at,
                        "text": strings.read(text_at, f"Entry {index} language column {column}"),
                    }
                    for column, text_at in enumerate(content_offsets)
                ],
            }
        )
    return {
        "schema_version": 1,
        "version": version,
        "file_bytes": len(data),
        "content_sha256": hashlib.sha256(data).hexdigest(),
        "header": {
            "header_offset": header_offset,
            "entry_count": entry_count,
            "attribute_count": attribute_count,
            "language_count": language_count,
            "padding": padding,
            "data_offset": pool_at,
            "unknown_data_offset": unknown_at,
            "unknown_data_hex": unknown_data,
            "language_offset": language_at,
            "attribute_type_offset": attribute_type_at,
            "attribute_name_offset": attribute_name_at,
        },
        "languages": languages,
        "duplicate_language_ids": duplicate_language_ids,
        "attribute_definitions": definitions,
        "entries": entries,
        "string_pool_bytes": len(pool),
        "decrypted_pool_sha256": hashlib.sha256(pool).hexdigest(),
    }
