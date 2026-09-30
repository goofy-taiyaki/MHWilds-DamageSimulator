// Validate fixes against this installation's extracted lottery table.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS, ARMOR, DECORATIONS } from '../js/data.js';
import { TALISMAN_GROUPS } from '../js/data/talisman.js';
import { buildSkillMatrix } from '../js/result_renderer.js';
const raw = new URL('../raw_data/game_extract/20260930-random/', import.meta.url);
const verified = JSON.parse(readFileSync(new URL('verified-groups.json', raw), 'utf8'));
const canonical = rows => rows.map(r => `${r.name}:${r.level}`).sort();
for (const [group, expected] of Object.entries(verified)) {
    assert.deepEqual(canonical(TALISMAN_GROUPS[group]), canonical(expected), `Game lottery group ${group}`);
    assert.equal(new Set(canonical(TALISMAN_GROUPS[group])).size, TALISMAN_GROUPS[group].length);
}
const byName = Object.fromEntries(SKILLS.map(s => [s.name, s.id]));
const stench = SKILLS.find(s => s.id === 'stench_resistance');
assert.equal(stench.maxLevel, 2);
assert.deepEqual(stench.effects.map(e => e.level), [1, 2]);
const deco = DECORATIONS.find(d => d.n === '耐臭珠【1】');
assert.ok(deco);
const arms = ARMOR.find(a => a.n === 'タリオスアームα');
assert.equal(arms.gs, '革細工の柔性');
assert.equal(SKILLS.find(s => s.id === byName[arms.gs]).isGroupSkill, true);
const empty = { sk: [], ss: '', gs: '' };
for (const count of [1, 2, 3]) {
    const pieces = Array.from({ length: 5 }, (_, i) => i < count ? arms : empty);
    const [h,c,a,w,l] = pieces;
    const matrix = buildSkillMatrix({h,c,a,w,l,t:{skills:{}}}, {}, [{piece:0,deco}], byName);
    assert.equal(matrix[byName['革細工の柔性']].total, count, 'Group-piece points retained');
    assert.equal(matrix.stench_resistance.total, 1, 'Decoration resolves to added skill');
}
assert.equal(SKILLS.find(s => s.id === 'skill_9sybh3').maxLevel, 1);
const source = readFileSync(new URL('../js/data/skills.js', import.meta.url), 'utf8');
const omega = source.match(/  \{\n    "id": "omega_resonance_[\s\S]*?(?=\n  \{\n    "id":|\n\];)/g);
assert.deepEqual(omega, JSON.parse(readFileSync(new URL('omega-before.json', raw), 'utf8')), 'Omega source blocks unchanged');
console.log('PASS: all 10 lottery groups match game data; group/deco reference regressions; Omega blocks unchanged.');
