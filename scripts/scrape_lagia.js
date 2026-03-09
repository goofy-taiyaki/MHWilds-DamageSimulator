const https = require('https');
const fs = require('fs');

https.get('https://mhwilds.kiranico.com/ja/data/monsters/ragiakurusu', (res) => {
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

            // Ignore nameless or weird parts
            // Let's filter out '?' or empty strings that happen in the later table sections
            if (!pName || pName === '?' || pName.trim() === '') return;

            if (pName.startsWith('左') || pName.startsWith('右')) {
                pName = pName.substring(1);
            }

            let stName = d.state;

            // Just in case there's any state names like State_1, though usually Kiranico has various labels
            // If they are translated incorrectly, let's keep them as is unless we know specific replacements
            const finalName = (stName && stName.trim() !== '') ? `${pName}_${stName.trim()}` : pName;

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

        // Debug output to see what we extracted
        console.log("Extracted parts:");
        processed.forEach(p => console.log(p.name));

        const formattedParts = processed.map(d => {
            return `      { "name": "${d.name}", "sever": ${d.sever}, "blunt": ${d.blunt}, "ammo": ${d.ammo}, "fire": ${d.fire}, "water": ${d.water}, "thunder": ${d.thunder}, "ice": ${d.ice}, "dragon": ${d.dragon} }`;
        }).join(',\n');

        const newStr = `  "ラギアクルス": {\n    "parts": [\n${formattedParts}\n    ]\n  },`;

        let monstersJs = fs.readFileSync('js/data/monsters.js', 'utf8');
        const regex = /"ラギアクルス":\s*\{\s*"parts":\s*\[.*?\]\s*\},/s;
        if (regex.test(monstersJs)) {
            monstersJs = monstersJs.replace(regex, newStr);
            fs.writeFileSync('js/data/monsters.js', monstersJs);
            console.log("Successfully updated ラギアクルス in monsters.js");
        } else {
            console.log("Could not find ラギアクルス in monsters.js");
        }
    });
});
