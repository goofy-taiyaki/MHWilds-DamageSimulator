
import fs from 'fs';

const filePath = 'e:/Users/tai_r/Documents/AI/mhwilds-site/js/data/armor.js';
let raw = fs.readFileSync(filePath, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const ARMOR = JSON.parse(raw.replace('export const ARMOR = ', '').replace(/;\s*$/, '').trim());

// We only want to upgrade pieces that we JUST added and that haven't been upgraded.
// The pieces we just added are from the following series if they are Rare 5 or 6.
const newlyAddedSeries = ["ホープ", "レザー", "チェーン", "ボーン", "アロイ", "ブブラチカ", "タリオス", "ピラギル", "ランゴ", "ラクノダズ"];

const upgradedARMOR = ARMOR.map(a => {
    if (!newlyAddedSeries.includes(a.s)) return a;
    
    // Check if it's Rare 5 or 6 and not already upgraded
    // Since we just added these from the table, we know they are not upgraded yet.
    if (a.ra === 5) {
        // [x, y, z] -> [x+1, y+1, z+1]
        a.sl = a.sl.map(v => Math.min(4, v + 1));
    } else if (a.ra === 6) {
        // [x, y, z] -> [x+1, y+1, z]
        a.sl[0] = Math.min(4, a.sl[0] + 1);
        a.sl[1] = Math.min(4, a.sl[1] + 1);
    }
    return a;
});

fs.writeFileSync(filePath, `export const ARMOR = ${JSON.stringify(upgradedARMOR)};\n`, 'utf8');
console.log(`Upgraded slots for newly added Rare 5/6 pieces.`);

