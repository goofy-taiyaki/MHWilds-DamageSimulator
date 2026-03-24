
import { ARMOR } from './js/data/armor.js';
import { SKILLS } from './js/data/skills.js';
import { DECORATIONS } from './js/data/decorations.js';

const targetArmorNames = ['クイーンピアスα', 'エグゾルスメイルγ', '護火竜アームβ', '護火竜コイルβ', 'トゥナムルグリーヴγ'];
const foundArmor = ARMOR.filter(a => targetArmorNames.includes(a.n));

console.log('--- Target Armor Found ---');
const armorByPart = {};
foundArmor.forEach(a => {
    armorByPart[a.p] = a;
    console.log(`${a.p}: ${a.n} | sk: ${JSON.stringify(a.sk)} | slots: ${JSON.stringify(a.sl)} | ss: ${a.ss || '-'} | gs: ${a.gs || '-'}`);
});

const SKILL_BY_NAME = Object.fromEntries(SKILLS.map(s => [s.name, s]));

// ポイント合算
const pts = {};
const addSkill = (name, p) => { if (name) pts[name] = (pts[name] || 0) + p; };

// 1. 防具
foundArmor.forEach(a => {
    if (a.sk) a.sk.forEach(s => addSkill(s.n, s.l));
    if (a.ss) addSkill(a.ss, 1);
    if (a.gs) addSkill(a.gs, 1);
});

// 2. 護石 (達人芸 1, 属性変換 1)
addSkill('達人芸', 1);
addSkill('属性変換', 1);

// 3. 武器 (黒蝕竜の力, ヌシの魂) -> 各1点
addSkill('黒蝕竜の力', 1);
addSkill('ヌシの魂', 1);

// 4. 装飾品 (手動指定)
const decos = [
    { sk: '挑戦者', p: 1, sl: 3 }, // クイーン[3]
    { sk: '早食い', p: 1, sl: 1 }, // クイーン[1]
    { sk: '早食い', p: 1, sl: 1 }, // クイーン[1]
    
    { sk: '逆襲', p: 3, sl: 3 },    // エグゾルス[3] (反攻珠[3] = 逆襲3?)
    { sk: '鎖刃刺撃', p: 1, sl: 3 }, // エグゾルス[3]
    
    { sk: '挑戦者', p: 1, sl: 3 }, // 護火竜腕[3]
    { sk: '逆襲', p: 2, sl: 2 },    // 護火竜腕[2] (反攻珠[2] = 逆襲2?)
    { sk: '早食い', p: 1, sl: 1 }, // 護火竜腕[1]
    
    { sk: '挑戦者', p: 1, sl: 3 }, // 護火竜腰[3]
    { sk: '挑戦者', p: 1, sl: 3 }, // 護火竜腰[3]
    { sk: '無我の境地', p: 1, sl: 1 }, // 護火竜腰[1]
    
    { sk: '力の解放', p: 1, sl: 3 }, // トゥナムル[3]
    { sk: '無我の境地', p: 1, sl: 1 }, // トゥナムル[1]
    { sk: '龍耐性', p: 1, sl: 1 }, // トゥナムル[1]
    
    { sk: '見切り', p: 1, sl: 1 }, // 護石[1]
    { sk: '龍耐性', p: 1, sl: 1 }, // 護石[1]
    { sk: '龍耐性', p: 1, sl: 1 }  // 護石[1]
];

decos.forEach(d => addSkill(d.sk, d.p));

console.log('\n--- Final Skill Total ---');
const goals = {
    '超会心': 5, '見切り': 4, '達人芸': 1, '挑戦者': 5, '逆襲': 3,
    '龍耐性': 3, '納刀術': 3, '早食い': 3, '無我の境地': 2, '巧撃': 1,
    '弱点特効': 1, '属性変換': 1, '力の解放': 1, '連撃': 1, '鎖刃刺撃': 1,
    '風圧耐性': 1, '火竜の力': 1, '黒蝕竜の力': 1, 'ヌシの魂': 1
};

Object.keys(goals).sort().forEach(name => {
    const current = pts[name] || 0;
    const goal = goals[name];
    console.log(`${(name + ' '.repeat(15)).slice(0, 15)}: ${current} / ${goal} ${current >= goal ? 'OK' : 'MISS'}`);
});
