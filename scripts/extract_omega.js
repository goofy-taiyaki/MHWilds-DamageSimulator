const fs = require('fs');

const path = require('path');
const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'raw_data/omega_raw.html'), 'utf8');

const rowRegex = /<tr class="[^"]*?border-b[^"]*?">(.*?)<\/tr>/g;
let match;
const data = [];

function stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '').trim();
}

while ((match = rowRegex.exec(html)) !== null) {
    const rowObj = match[1];
    if (rowObj.includes('<th')) continue;

    const tds = [];
    const tdRegex = /<td[^>]*>(.*?)<\/td>/g;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowObj)) !== null) {
        tds.push(stripHtml(tdMatch[1]));
    }

    // Hitzone rows have 11 columns and third column is number
    if (tds.length === 11 && !isNaN(parseInt(tds[2]))) {
        data.push({
            partName: tds[0],
            state: tds[1],
            slash: parseInt(tds[2]) || 0,
            strike: parseInt(tds[3]) || 0,
            shell: parseInt(tds[4]) || 0,
            fire: parseInt(tds[5]) || 0,
            water: parseInt(tds[6]) || 0,
            thunder: parseInt(tds[7]) || 0,
            ice: parseInt(tds[8]) || 0,
            dragon: parseInt(tds[9]) || 0
        });
    }
}

// Processing the data
// Merge Left and Right parts
// Change State_1 to パントラクルモード
// Use under_score

const processed = [];
const seen = new Set();

data.forEach(d => {
    let pName = d.partName;
    if (pName.startsWith('左') || pName.startsWith('右')) {
        pName = pName.substring(1); // remove left/right prefix
    }

    let stName = d.state;
    if (stName === 'State_1') stName = 'パントラクルモード';

    const finalName = stName ? `${pName}_${stName}` : pName;

    if (!seen.has(finalName)) {
        seen.add(finalName);
        processed.push({
            name: finalName,
            slash: d.slash,
            strike: d.strike,
            shell: d.shell,
            fire: d.fire,
            water: d.water,
            thunder: d.thunder,
            ice: d.ice,
            dragon: d.dragon
        });
    }
});

fs.writeFileSync(path.join(rootDir, 'raw_data/omega_processed.json'), JSON.stringify(processed, null, 2));
console.log("Extracted and processed data to omega_processed.json");

