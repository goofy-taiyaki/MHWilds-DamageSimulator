
import { SKILLS } from '../js/data/skills.js';
const SKILL_NAME_TO_ID = {};
SKILLS.forEach(s => { SKILL_NAME_TO_ID[s.name] = s.id; });
console.log("毛皮の昂揚 ID:", SKILL_NAME_TO_ID["毛皮の昂揚"]);
console.log("毛皮の昴揚 ID:", SKILL_NAME_TO_ID["毛皮の昴揚"]);

