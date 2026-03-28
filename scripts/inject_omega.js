const fs = require('fs');

const path = require('path');
const rootDir = path.resolve(__dirname, '..');
const processedData = JSON.parse(fs.readFileSync(path.join(rootDir, 'raw_data/omega_processed.json'), 'utf8'));

// Format to match monsters.js
const formattedParts = processedData.map(d => {
    return `      { "name": "${d.name}", "sever": ${d.slash}, "blunt": ${d.strike}, "ammo": ${d.shell}, "fire": ${d.fire}, "water": ${d.water}, "thunder": ${d.thunder}, "ice": ${d.ice}, "dragon": ${d.dragon} }`;
}).join(',\n');

const newOmegaStr = `  "オメガ": {\n    "parts": [\n${formattedParts}\n    ]\n  },`;

let monstersJs = fs.readFileSync(path.join(rootDir, 'js/data/monsters.js'), 'utf8');

// Use regex to replace the entire "オメガ": { ... }, block
// We need to account for single-line or multi-line "オメガ" definitions.
const regex = /"オメガ":\s*\{\s*"parts":\s*\[.*?\]\s*\},/s;
if (regex.test(monstersJs)) {
    monstersJs = monstersJs.replace(regex, newOmegaStr);
    fs.writeFileSync(path.join(rootDir, 'js/data/monsters.js'), monstersJs);
    console.log("Successfully updated オメガ in monsters.js");
} else {
    // If there is no trailing comma (e.g. at the very end), adjust
    const regexEnd = /"オメガ":\s*\{\s*"parts":\s*\[.*?\]\s*\}/s;
    if (regexEnd.test(monstersJs)) {
        monstersJs = monstersJs.replace(regexEnd, newOmegaStr.replace(/,$/, ''));
        fs.writeFileSync(path.join(rootDir, 'js/data/monsters.js'), monstersJs);
        console.log("Successfully updated オメガ in monsters.js (at end of object)");
    } else {
        console.log("Could not find オメガ in monsters.js");
    }
}

