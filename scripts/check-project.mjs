// Read-only structural audit; game accuracy and browser behavior are separate.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { SKILLS, ARMOR, DECORATIONS, WEAPONS, MONSTERS } from '../js/data.js';
import { TALISMAN_GROUPS } from '../js/data/talisman.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [], warnings = [];
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const checkSource = (source, file, module = true) => {
    const result = spawnSync(process.execPath, [...(module ? ['--input-type=module'] : []), '--check'], { input: source, encoding: 'utf8' });
    if (result.status !== 0) errors.push({ kind: 'syntax', file, detail: result.stderr || result.error?.message });
    for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*)['"](\.[^'"]+)['"]/g)) {
        if (!existsSync(path.resolve(root, path.dirname(file), match[1]))) errors.push({ kind: 'missing-import', file, target: match[1] });
    }
};
const jsFiles = walk(path.join(root, 'js')).filter(f => f.endsWith('.js') && !f.endsWith('asst_backup.js'));
for (const file of jsFiles) checkSource(readFileSync(file, 'utf8'), path.relative(root, file));
const pages = readdirSync(root).filter(f => f.endsWith('.html'));
for (const file of pages) {
    const source = readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!/\bsrc\s*=/.test(match[1]) && match[2].trim()) checkSource(match[2], file, /type\s*=\s*['"]module['"]/.test(match[1]));
    }
    for (const match of source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, tag => tag.replace(/>[^]*$/, '>')).matchAll(/\b(?:src|href)\s*=\s*['"]([^'"]+)['"]/g)) {
        const target = match[1].split(/[?#]/)[0];
        if (!target || /^(?:[a-z]+:|\/\/)/i.test(target)) continue;
        if (!existsSync(path.resolve(root, target))) errors.push({ kind: 'missing-resource', file, target });
    }
}
const duplicate = (items, key, label) => {
    const seen = new Set();
    for (const item of items) {
        if (seen.has(item[key])) errors.push({ kind: 'duplicate', collection: label, key, value: item[key] });
        seen.add(item[key]);
    }
};
duplicate(SKILLS, 'id', 'skills');
duplicate(SKILLS, 'name', 'skills');
duplicate(ARMOR, 'n', 'armor');
duplicate(DECORATIONS, 'n', 'decorations');
const byName = new Map(SKILLS.map(s => [s.name, s]));
const reference = (name, level, owner) => {
    const skill = byName.get(name);
    if (!skill) errors.push({ kind: 'unknown-skill', owner, name });
    else if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > skill.maxLevel)) warnings.push({ kind: 'skill-level', owner, name, level, maxLevel: skill.maxLevel });
};
for (const item of [...ARMOR, ...DECORATIONS]) {
    for (const skill of item.sk || []) reference(skill.n, skill.l, item.n);
    for (const name of [item.ss, item.gs].filter(Boolean).flatMap(v => v.split(',').map(s => s.trim()))) reference(name, undefined, item.n);
}
for (const [group, skills] of Object.entries(TALISMAN_GROUPS)) for (const skill of skills) reference(skill.name, skill.level, `talisman:${group}`);
for (const skill of SKILLS) {
    const hasEffects = skill.weaponSpecific
        ? Object.values(skill.weaponEffects || {}).some(effects => Array.isArray(effects) && effects.length > 0)
        : Array.isArray(skill.effects) && skill.effects.length > 0;
    if (!skill.maxLevel || !hasEffects) warnings.push({ kind: 'empty-skill', id: skill.id, name: skill.name });
}
const report = { scope: 'Static structure and data references; excludes browser behavior and game accuracy.', counts: { pages: pages.length, jsFiles: jsFiles.length, skills: SKILLS.length, armor: ARMOR.length, decorations: DECORATIONS.length, weapons: WEAPONS.length, monsters: Object.keys(MONSTERS).length }, errors, warnings };
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else { console.log(JSON.stringify(report.counts)); console.log(`Errors: ${errors.length}; Warnings: ${warnings.length}`); for (const finding of [...errors, ...warnings]) console.log(JSON.stringify(finding)); }
process.exitCode = errors.length ? 1 : 0;


