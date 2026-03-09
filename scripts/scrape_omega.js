const https = require('https');
const fs = require('fs');

https.get('https://mhwilds.kiranico.com/ja/data/monsters/omegapuranetesu', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        // Look for the JSON data-page attribute
        const match = data.match(/data-page="([^"]+)"/);
        if (match) {
            // It's html entity encoded, need to decode
            let jsonStr = match[1].replace(/&quot;/g, '"');
            try {
                const parsed = JSON.parse(jsonStr);
                const props = parsed.props;
                if (props.monster && props.monster.hitzones) {
                    fs.writeFileSync('omega_hitzones.json', JSON.stringify(props.monster.hitzones, null, 2));
                    console.log("Wrote omega_hitzones.json. Parts:", props.monster.hitzones.length);
                } else {
                    console.log("Hitzones not found in props");
                }
            } catch (e) {
                console.log("JSON parse error", e);
            }
        } else {
            console.log("Could not find data-page attribute.");
            fs.writeFileSync('omega_raw.html', data);
        }
    });
});
