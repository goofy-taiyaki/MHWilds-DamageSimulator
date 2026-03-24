
import { SKILLS } from './js/data/skills.js';
const names = ['達人芸', '挑戦者', '龍耐性', '納刀術', '早食い', '無我の境地', '鎖刃刺撃', '風圧耐性', '火竜の力', '黒蝕竜の力', 'ヌシの魂', '連撃', '力の解放', '属性変換', '弱点特効', '巧撃', '超会心', '見切り', '逆襲'];
names.forEach(n => {
    const s = SKILLS.find(x => x.name.includes(n));
    console.log(`${n}: ${s ? s.id : 'NOT FOUND'}`);
});
