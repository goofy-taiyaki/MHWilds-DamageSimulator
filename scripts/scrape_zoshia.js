const https = require('https');
const fs = require('fs');

const target = {
    name: 'ゾシア',
    url: 'https://mhwilds.kiranico.com/ja/data/monsters/zoshia',
    stateRemap: {
        'State_1': '白熱状態'
    }
};

function processMonster(target) {
    return new Promise((resolve) => {
        https.get(target.url, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                let match;
                const hitzones = [];
                const rowRegex = /<tr class="[^"]*?border-b[^"]*?">(.*?)<\/tr>/g;

                function stripHtml(html) {
                    return html.replace(/<[^>]*>?/gm, '').trim();
                }

                while ((match = rowRegex.exec(data)) !== null) {
                    const rowObj = match[1];
                    if (rowObj.includes('<th')) continue;

                    const tds = [];
                    const tdRegex = /<td[^>]*>(.*?)<\/td>/g;
                    let tdMatch;
                    while ((tdMatch = tdRegex.exec(rowObj)) !== null) {
                        tds.push(stripHtml(tdMatch[1]));
                    }

                    if (tds.length === 11 && !isNaN(parseInt(tds[2]))) {
                        hitzones.push({
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

                const processed = [];
                const seen = new Set();

                hitzones.forEach(d => {
                    let pName = d.partName;

                    if (!pName || pName === '?' || pName.trim() === '') return;

                    if (pName.startsWith('左') || pName.startsWith('右')) {
                        pName = pName.substring(1);
                    }

                    let stName = d.state ? d.state.trim() : '';
                    if (target.stateRemap[stName]) {
                        stName = target.stateRemap[stName];
                    }
                    if (stName === 'State_1') stName = '特殊状態';

                    const finalName = stName ? `${pName}_${stName}` : pName;

                    if (!seen.has(finalName)) {
                        seen.add(finalName);
                        processed.push({
                            name: finalName,
                            sever: d.slash,
                            blunt: d.strike,
                            ammo: d.shell,
                            fire: d.fire,
                            water: d.water,
                            thunder: d.thunder,
                            ice: d.ice,
                            dragon: d.dragon
                        });
                    }
                });

                console.log(`Extracted parts for ${target.name}:`);
                processed.forEach(p => console.log("  - " + p.name));

                const formattedParts = processed.map(d => {
                    return `      { "name": "${d.name}", "sever": ${d.sever}, "blunt": ${d.blunt}, "ammo": ${d.ammo}, "fire": ${d.fire}, "water": ${d.water}, "thunder": ${d.thunder}, "ice": ${d.ice}, "dragon": ${d.dragon} }`;
                }).join(',\n');

                const newStr = `  "${target.name}": {\n    "parts": [\n${formattedParts}\n    ]\n  }`;

                let monstersJs = fs.readFileSync('js/data/monsters.js', 'utf8');

                // Matches the block for the monster. Note: might not have trailing comma if it's the last one.
                const regex = new RegExp(`"${target.name}":\\s*\\{\\s*"parts":\\s*\\[.*?\\]\\s*\\},?`, 's');
                if (regex.test(monstersJs)) {
                    // Check if it's the last element (doesn't have a comma after it in the original text)
                    const isLast = !monstersJs.match(regex)[0].endsWith(',');
                    monstersJs = monstersJs.replace(regex, newStr + (isLast ? '' : ','));
                    fs.writeFileSync('js/data/monsters.js', monstersJs);
                    console.log(`Successfully updated ${target.name} in monsters.js\n`);
                } else {
                    console.log(`Could not find ${target.name} block to replace in monsters.js\n`);
                }

                resolve();
            });
        });
    });
}

processMonster(target);
