"""Read selected game assets; never writes to the game directory. Python 3.14."""
import argparse, hashlib, json, re
from pathlib import Path
from compression import zstd
from game_formats.pak_index import read_index, path_hash
from game_formats.msg_container import parse_msg

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--game', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--asset', action='append', help='Explicit internal asset paths; replaces default set')
    args = parser.parse_args()
    game, out = args.game.resolve(), args.output.resolve()
    if out.is_relative_to(game) or game.is_relative_to(out):
        raise ValueError('Output must be separate from game files')
    out.mkdir(parents=True, exist_ok=False)
    paths = ['natives/stm/gamedesign/text/excel_equip/skill.msg.23', 'natives/stm/gamedesign/text/excel_equip/skillcommon.msg.23', 'natives/stm/gamedesign/common/equip/skilldata.user.3', 'natives/stm/gamedesign/common/equip/armordata.user.3', 'natives/stm/gamedesign/common/equip/accessorydata.user.3']
    paths = args.asset or paths
    lookup = {path_hash(p): p for p in paths}
    records = []
    for archive in sorted(game.glob('*.pak')):
        index = read_index(archive)
        for entry in index.entries:
            internal = lookup.get(entry.name_hash)
            if not internal: continue
            if entry.offset_is_chunk_index or entry.attributes not in (0, 2, 0x1002):
                raise ValueError(f'Unsupported entry: {archive.name}, {internal}')
            if max(entry.compressed_size, entry.uncompressed_size) > 16*1024*1024: raise ValueError('Asset too large')
            with archive.open('rb') as handle:
                handle.seek(entry.offset_raw)
                payload = handle.read(entry.compressed_size)
            if len(payload) != entry.compressed_size: raise ValueError('Truncated payload')
            data = payload if entry.attributes & 15 == 0 else zstd.decompress(payload)
            if len(data) != entry.uncompressed_size: raise ValueError('Size mismatch')
            filename = archive.name + '__' + Path(internal).name
            (out / filename).write_bytes(data)
            patch = re.search(r'\.patch_(\d+)\.pak$', archive.name)
            record = dict(archive=archive.name, internal_path=internal, patch=int(patch[1]) if patch else 0, archive_bytes=index.file_bytes, archive_modified_ns=index.modified_ns, metadata_sha256=index.metadata_sha256, offset=entry.offset_raw, attributes=entry.attributes, sha256=hashlib.sha256(data).hexdigest(), extracted_file=filename)
            if '.msg.' in internal:
                parsed = parse_msg(data)
                record['messages'] = [dict(key=e['name'], guid=e['guid'], japanese=next((m['text'] for m in e['messages'] if m['language_id']==0), None)) for e in parsed['entries']]
            records.append(record)
            print(archive.name, internal, len(data), flush=True)
    report = dict(source=str(game), precedence='All occurrences retained; higher patch number is a candidate, not a verified runtime load order.', records=records)
    (out/'manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Extracted occurrences:', len(records))
if __name__ == '__main__': main()

