import { mkdirSync, copyFileSync, writeFileSync, existsSync, readFileSync, lstatSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEAPON_TYPES } from '../js/data/weapons.js';
import { SKILL_ICON_MAP } from '../js/data/skill_icons.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const result = spawnSync(process.execPath, [path.join(root, 'scripts/check-project.mjs'), '--json'], { encoding: 'utf8' });
const report = JSON.parse(result.stdout);
const protectedOwners = new Set(['オメガイヤーカフα','オメガスーツα','オメガアームα','オメガアクセサリーα','オメガレッグα']);
const unexpected = report.errors.filter(e => !(e.kind === 'unknown-skill' && e.name === 'オメガレゾナンス' && protectedOwners.has(e.owner)));
if (unexpected.length || report.warnings.length) throw new Error(JSON.stringify({unexpected,warnings:report.warnings}));
console.log(`Structural check: ${report.errors.length} preserved Omega references; no other errors or warnings.`);
const manifest = JSON.parse(readFileSync(path.join(root, 'scripts/public-files.json'), 'utf8'));
const files = new Set(manifest.files);
if (files.size !== manifest.files.length) throw new Error('Duplicate public file.');
for (const file of files) {
    if (!/^(?:[\w-]+\.html|(?:css|js|assets)\/[\w./-]+)$/.test(file) || file.split('/').includes('..') || /(?:\.bak|\.mjs|asst_backup\.js)$/.test(file)) throw new Error(`Invalid public file: ${file}`);
    if (!lstatSync(path.join(root, file)).isFile()) throw new Error(`Not a regular file: ${file}`);
    if (!/\.(?:html|css|js)$/.test(file)) continue;
    const source = readFileSync(path.join(root, file), 'utf8');
    const requireFile = target => {
        if (target.includes('${') || /^(?:[a-z]+:|\/\/|#)/i.test(target)) return;
        const clean = target.split(/[?#]/)[0];
        if (!clean) return;
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), clean));
        if (!files.has(resolved)) throw new Error(`Unpackaged reference: ${file} -> ${target}`);
    };
    for (const m of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.[^'"]+)['"]/g)) requireFile(m[1]);
    if (file.endsWith('.html')) for (const m of source.matchAll(/\b(?:src|href)\s*=\s*['"]([^'"]+)['"]/g)) requireFile(m[1]);
    if (file.endsWith('.css') || file.endsWith('.html')) for (const m of source.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) requireFile(m[1]);
    for (const m of source.matchAll(/['"`](assets\/[\w./-]+\.(?:png|webp|jpg|svg))['"`]/g)) {
        if (!files.has(m[1])) throw new Error(`Unpackaged asset: ${file} -> ${m[1]}`);
    }
}
for (const page of manifest.pages) if (!files.has(page)) throw new Error(`Missing page: ${page}`);
// These filenames are assembled at runtime, so literal reference checks cannot find them.
for (const weapon of WEAPON_TYPES) {
    const id = { hammer: 'hm', lance: 'lnc', sa: 'sax' }[weapon.id] || weapon.id;
    if (!files.has(`assets/icons/weapons/${id}.webp`)) throw new Error(`Missing weapon icon: ${id}`);
}
for (const category of new Set(Object.values(SKILL_ICON_MAP))) {
    if (!files.has(`assets/icons/skills/${category.toLowerCase()}.webp`)) throw new Error(`Missing skill icon: ${category}`);
}
const dest = path.resolve(root, process.argv[2] || 'dist');
if (!dest.startsWith(path.resolve(root) + path.sep)) throw new Error('Build output must be inside the workspace.');
if (existsSync(dest)) throw new Error('dist already exists; use a clean build directory.');
mkdirSync(dest, { recursive: true });
for (const file of files) {
    const target = path.join(dest, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, file), target);
}
writeFileSync(path.join(dest,'.nojekyll'),'');
writeFileSync(path.join(dest,'version.json'),JSON.stringify({commit:process.env.GITHUB_SHA || 'local-preview',builtAt:new Date().toISOString()}));
console.log('Packaged six pages and runtime assets; research and extraction data excluded.');
