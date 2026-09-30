"""Decode extracted USER files against an explicit CRC-checked type database."""
import argparse, json
from pathlib import Path
from game_formats.rsz_fields import decode_fields
p=argparse.ArgumentParser()
p.add_argument('--database',type=Path,required=True)
p.add_argument('--directory',type=Path,action='append',required=True)
a=p.parse_args()
db=json.loads(a.database.read_text(encoding='utf-8'))
for directory in a.directory:
    manifest=json.loads((directory/'manifest.json').read_text(encoding='utf-8'))
    selected={}
    for r in manifest['records']:
        if '.user.' in r['internal_path'] and r['patch'] >= selected.get(r['internal_path'],{}).get('patch',-1): selected[r['internal_path']]=r
    for internal,r in selected.items():
        try:
            data=decode_fields((directory/r['extracted_file']).read_bytes(),db)
            dest=directory/(Path(internal).name+'-decoded.json')
            dest.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
            print(Path(internal).name, len(data['nodes']), 'CRC validated; fully consumed')
        except ValueError as e: print(Path(internal).name, 'NOT DECODED:', e)
