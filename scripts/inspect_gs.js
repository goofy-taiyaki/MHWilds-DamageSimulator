const https = require('https');

https.get('https://macarongamemo.com/entry/mhwilds-great_sword-motion', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/;
        const match = tableRegex.exec(data);
        if (match) {
            console.log(match[1].slice(0, 2000));
        }
    });
});
