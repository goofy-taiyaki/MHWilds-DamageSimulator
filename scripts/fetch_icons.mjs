import fs from 'fs';
import path from 'path';

const ICON_DIR = path.join(process.cwd(), 'icon', 'skills');
if (!fs.existsSync(ICON_DIR)) {
    fs.mkdirSync(ICON_DIR, { recursive: true });
}

async function main() {
    const text = fs.readFileSync('scripts/wiki.html', 'utf8');

    // We want to link the generic icon name (e.g. "Element_Skill_Icon") to the skill's specific English name (e.g. "Critical_Element")
    // Let's use a loose regex
    // We look for src="/images/thumb/.../MHWilds-[NAME]_Icon.png/..." 
    // followed eventually by <a href="/wiki/[SKILL_NAME]_(MHWilds)"
    // We can split the HTML by <tr> or <div> and find pairs.
    const blocks = text.split(/(<div style="display: flex;|<tr)/);

    const skillIconMap = new Map();
    const uniqueImages = new Map();

    blocks.forEach(b => {
        const imgMatch = b.match(/src="([^"]+MHWilds-([a-zA-Z_]+)_Icon\.png(?:\/[^"]*)?)"/);
        const nameMatch = b.match(/href="\/wiki\/([a-zA-Z0-9_%]+)_\(MHWilds\)"/);

        if (imgMatch && nameMatch) {
            let url = imgMatch[1];
            if (url.startsWith('/')) url = 'https://monsterhunterwiki.org' + url;
            // Clean up the URL to get the base PNG, not the thumb if we want, but thumb is fine.
            if (url.includes('.webp')) {
                // we'll download whatever it is
            }
            // fix URL encoding issues
            url = url.replace(/&amp;/g, '&');

            let iconName = imgMatch[2]; // e.g. Element_Skill
            let engNameDecoded = decodeURIComponent(nameMatch[1]).toLowerCase().replace(/ /g, '_');

            // Because some names have '%27' like "Dragon's_Heart" -> "dragon's_heart"

            skillIconMap.set(engNameDecoded, iconName);
            uniqueImages.set(iconName, url);
        }
    });

    console.log(`Found ${uniqueImages.size} unique icons.`);

    for (const [iconName, url] of uniqueImages.entries()) {
        const ext = url.endsWith('.webp') ? '.webp' : '.png';
        const destPath = path.join(ICON_DIR, `${iconName.toLowerCase()}${ext}`);
        try {
            const imgRes = await fetch(url);
            const arrayBuffer = await imgRes.arrayBuffer();
            fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
        } catch (err) { }
    }

    // Also let's save a map file so we can see which skill uses which generic icon
    fs.writeFileSync('assets/icons/skills/mapping.json', JSON.stringify(Object.fromEntries(skillIconMap), null, 2));

    console.log('Done mapping and downloading.');
}
main();

