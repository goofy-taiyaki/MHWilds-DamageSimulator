
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const armorFile = path.resolve(__dirname, '../js/data/armor.js');

let content = fs.readFileSync(armorFile, 'utf8');

content = content.replace(/毛皮の昴揚/g, '毛皮の昂揚');
content = content.replace(/泡狐竜 de 力量/g, '泡狐竜の力');
content = content.replace(/祝祭 de 巡り/g, '祝祭の巡り');
content = content.replace(/ヌシ의魂/g, 'ヌシの魂');
content = content.replace(/革細工의 柔性/g, '革細工の柔性');

fs.writeFileSync(armorFile, content, 'utf8');
console.log("Armor data corrected.");

