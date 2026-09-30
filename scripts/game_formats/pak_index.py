"""Bounded, read-only Wilds PAK v4.1/v4.2 metadata inspection.

Format/cipher reference: eigeen/ree-pak-rs @ 25562e6a6f9a52a43b80d54be91e4feb7ac7668b.
See docs/THIRD_PARTY_NOTICES.md. No payload extraction or game process access.
"""

import argparse
import hashlib
import json
import os
import re
import struct
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

HEADER = struct.Struct("<4sBBHII")
ENTRY = struct.Struct("<IIQQQQQ")
ENCRYPTED_INDEX = 0x08
CHUNK_TABLE = 0x20
CHUNK_OFFSET = 1 << 24
MAX_ENTRIES = 500_000
MAX_LIST_BYTES = 64 * 1024 * 1024
MASK32 = 0xFFFFFFFF
DEFAULT_PATTERN = (
    r"character.?edit|chara.?edit|chara.?make|character.?create|hunter.?edit|edit.?chara"
)
MODULUS = int.from_bytes(
    bytes.fromhex(
        "7d0bf8c17c23fd3bd47516d23321d81071f97cd13493ba7726fcab2ceedad91c"
        "89e7297bdd8aae5039b6016d21895da5a13ea2c08c93133665ebe8df06176796"
        "062bac23ed8cb78b90adea71c440449d1c7bbac4b62dd6d24b62d626fc7420"
        "07ece3599ae6afb9a8358be0e8d3cd4565b091c4951bf3231ec671cf3e352d6be300"
    ),
    "little",
)


class PakFormatError(ValueError):
    """Unsupported or inconsistent metadata; no partial success is reported."""


@dataclass(frozen=True, slots=True)
class PakEntry:
    hash_lower: int
    hash_upper: int
    offset_raw: int
    compressed_size: int
    uncompressed_size: int
    attributes: int
    checksum: int

    @property
    def name_hash(self) -> int:
        return (self.hash_upper << 32) | self.hash_lower

    @property
    def offset_is_chunk_index(self) -> bool:
        return bool(self.attributes & CHUNK_OFFSET)


@dataclass(frozen=True)
class PakIndex:
    path: str
    file_bytes: int
    modified_ns: int
    major: int
    minor: int
    feature: int
    header_hash_raw: int
    metadata_bytes_read: int
    metadata_sha256: str
    entries: tuple[PakEntry, ...]


def decrypt_table(table: bytes, encrypted_key: bytes) -> bytes:
    if len(encrypted_key) != 128:
        raise PakFormatError("Expected a 128-byte index key.")
    if not table:
        return b""
    key_int = pow(int.from_bytes(encrypted_key, "little"), 65537, MODULUS)
    key = key_int.to_bytes(128, "little")
    return bytes(value ^ ((i + key[i % 32] * key[i % 29]) & 255) for i, value in enumerate(table))


def read_index(path: Path, *, max_entries: int = MAX_ENTRIES) -> PakIndex:
    """Read header, TOC and optional key, never data blocks or the chunk table."""
    if max_entries < 0 or max_entries > MAX_ENTRIES:
        raise ValueError(f"max_entries must be between 0 and {MAX_ENTRIES}.")
    with path.open("rb") as handle:
        before = os.fstat(handle.fileno())
        raw_header = handle.read(HEADER.size)
        if len(raw_header) != HEADER.size:
            raise PakFormatError("Truncated PAK header.")
        magic, major, minor, feature, count, header_hash = HEADER.unpack(raw_header)
        if magic != b"KPKA":
            raise PakFormatError("Invalid PAK magic.")
        if major != 4 or minor not in (1, 2):
            raise PakFormatError(f"Unsupported PAK version {major}.{minor}.")
        if feature & ~(ENCRYPTED_INDEX | CHUNK_TABLE):
            raise PakFormatError(f"Unsupported PAK feature flags 0x{feature:04x}.")
        if count > max_entries:
            raise PakFormatError(f"Entry count {count} exceeds limit {max_entries}.")
        table_bytes = count * ENTRY.size
        key_bytes = 128 if feature & ENCRYPTED_INDEX else 0
        metadata_bytes = HEADER.size + table_bytes + key_bytes
        if metadata_bytes > before.st_size:
            raise PakFormatError("Declared index/key extends past the end of the PAK.")
        raw_table = handle.read(table_bytes)
        raw_key = handle.read(key_bytes)
        if len(raw_table) != table_bytes or len(raw_key) != key_bytes:
            raise PakFormatError("Truncated index or key.")
        after = os.fstat(handle.fileno())
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            raise PakFormatError("PAK changed during metadata inspection.")
    digest = hashlib.sha256(raw_header + raw_table + raw_key).hexdigest()
    table = decrypt_table(raw_table, raw_key) if key_bytes else raw_table
    entries = tuple(PakEntry(*values) for values in ENTRY.iter_unpack(table))
    for index, entry in enumerate(entries):
        if entry.offset_is_chunk_index:
            if not feature & CHUNK_TABLE:
                raise PakFormatError(f"Entry {index}: chunk offset without chunk-table feature.")
        elif entry.compressed_size:
            if entry.offset_raw < metadata_bytes:
                raise PakFormatError(f"Entry {index}: data offset overlaps metadata.")
            if entry.offset_raw + entry.compressed_size > before.st_size:
                raise PakFormatError(f"Entry {index}: declared data exceeds file size.")
    return PakIndex(
        str(path.resolve()),
        before.st_size,
        before.st_mtime_ns,
        major,
        minor,
        feature,
        header_hash,
        metadata_bytes,
        digest,
        entries,
    )


def _rotate32(value: int, bits: int) -> int:
    return ((value << bits) | (value >> (32 - bits))) & MASK32


def murmur3_x86_32(data: bytes, seed: int = MASK32) -> int:
    value = seed & MASK32
    end = len(data) - len(data) % 4
    for offset in range(0, end, 4):
        block = int.from_bytes(data[offset : offset + 4], "little")
        block = _rotate32((block * 0xCC9E2D51) & MASK32, 15)
        value ^= (block * 0x1B873593) & MASK32
        value = (_rotate32(value, 13) * 5 + 0xE6546B64) & MASK32
    if end < len(data):
        tail = int.from_bytes(data[end:], "little")
        tail = _rotate32((tail * 0xCC9E2D51) & MASK32, 15)
        value ^= (tail * 0x1B873593) & MASK32
    value ^= len(data)
    value ^= value >> 16
    value = (value * 0x85EBCA6B) & MASK32
    value ^= value >> 13
    value = (value * 0xC2B2AE35) & MASK32
    return value ^ (value >> 16)


def path_hash(path: str) -> int:
    # This deliberately supports only the ASCII paths verified in the reference list.
    if not path or not path.isascii():
        raise ValueError("Only nonempty ASCII reference paths are supported.")
    normalized = path.replace("\\", "/")
    lower = murmur3_x86_32(normalized.lower().encode("utf-16le"))
    upper = murmur3_x86_32(normalized.upper().encode("utf-16le"))
    return (upper << 32) | lower


def scan_directory(directory: Path, file_list: Path, pattern: str) -> dict:
    """Match candidate name hashes, preserving all archive occurrences and collisions."""
    if not directory.is_dir():
        raise ValueError("Game directory does not exist.")
    with file_list.open("rb") as handle:
        raw_list = handle.read(MAX_LIST_BYTES + 1)
    if len(raw_list) > MAX_LIST_BYTES:
        raise ValueError("Reference file list exceeds the 64 MiB limit.")
    expression = re.compile(pattern, re.IGNORECASE)
    names = sorted(
        {
            line.strip().replace("\\", "/")
            for line in raw_list.decode("utf-8-sig").splitlines()
            if line.strip() and not line.lstrip().startswith("#") and expression.search(line)
        }
    )
    if not names:
        raise ValueError("No reference names match the requested pattern.")
    candidates: dict[int, list[str]] = {}
    for name in names:
        candidates.setdefault(path_hash(name), []).append(name)
    archives = sorted(
        path for path in directory.iterdir() if path.is_file() and path.suffix == ".pak"
    )
    if not archives:
        raise ValueError("No .pak files in the selected directory.")
    archive_reports = []
    matched_names: set[str] = set()
    total_entries = 0
    total_read = 0
    for path in archives:
        pak = read_index(path)
        matches = []
        for entry in pak.entries:
            matching_names = candidates.get(entry.name_hash)
            if matching_names:
                matched_names.update(matching_names)
                matches.append(
                    {
                        "candidate_paths": matching_names,
                        "name_hash": f"{entry.name_hash:016x}",
                        "hash_collision": len(matching_names) > 1,
                        "offset_is_chunk_index": entry.offset_is_chunk_index,
                        **asdict(entry),
                    }
                )
        archive_reports.append(
            {
                "name": path.name,
                "file_bytes": pak.file_bytes,
                "modified_ns": pak.modified_ns,
                "version": f"{pak.major}.{pak.minor}",
                "feature": f"0x{pak.feature:04x}",
                "entry_count": len(pak.entries),
                "chunk_offset_count": sum(e.offset_is_chunk_index for e in pak.entries),
                "metadata_bytes_read": pak.metadata_bytes_read,
                "metadata_sha256": pak.metadata_sha256,
                "candidate_matches": matches,
            }
        )
        total_entries += len(pak.entries)
        total_read += pak.metadata_bytes_read
    return {
        "schema_version": 1,
        "observed_utc": datetime.now(UTC).isoformat(),
        "source_directory": str(directory.resolve()),
        "python_version": sys.version.split()[0],
        "reference_list": {
            "path": str(file_list.resolve()),
            "bytes": len(raw_list),
            "sha256": hashlib.sha256(raw_list).hexdigest(),
            "pattern": pattern,
            "candidate_path_count": len(names),
        },
        "pak_count": len(archives),
        "entry_count": total_entries,
        "metadata_bytes_read": total_read,
        "version_counts": dict(Counter(item["version"] for item in archive_reports)),
        "matched_candidate_path_count": len(matched_names),
        "unmatched_candidate_paths": sorted(set(names) - matched_names),
        "archives": archive_reports,
        "limitations": [
            "Names are candidates matched by hash against the supplied reference list.",
            "Every archive occurrence is retained; effective patch priority is not inferred.",
            "Chunk indices are raw metadata; the chunk table and payload were not read.",
            "Payload checksums, contents, UI mapping and character values are not verified.",
        ],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", type=Path, required=True)
    parser.add_argument("--file-list", type=Path, required=True)
    parser.add_argument("--pattern", default=DEFAULT_PATTERN)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    try:
        # Keep report writes outside the input tree and never replace existing files.
        if args.output:
            target = args.output.resolve()
            if target.is_relative_to(args.game_dir.resolve()) or target == args.file_list.resolve():
                raise ValueError("Output must be outside the game tree and separate from the list.")
            if target.exists():
                raise FileExistsError("Output already exists; choose a new report path.")
        report = scan_directory(args.game_dir, args.file_list, args.pattern)
        text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
        if args.output:
            with args.output.open("x", encoding="utf-8", newline="\n") as handle:
                handle.write(text)
        else:
            print(text, end="")
    except (OSError, ValueError, re.error) as exc:
        print(f"PAK inspection failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
