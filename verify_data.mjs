
import { ARMOR } from './js/data/armor.js';
import { DECORATIONS } from './js/data/decorations.js';
import { SKILLS } from './js/data/skills.js';

const searchNames = ['クイーンピアスα', 'エグゾルスメイルγ', '護火竜アームβ', '護火竜コイルβ', 'トゥナムルグリーヴγ'];

console.log('--- Armor Verification ---');
searchNames.forEach(name => {
    const found = ARMOR.find(a => a.n === name);
    if (found) {
        console.log(`Found: ${name}`, JSON.stringify(found, null, 2));
    } else {
        console.log(`NOT FOUND: ${name}`);
        // Partial match
        const partial = ARMOR.filter(a => a.n.includes(name.slice(0, 3)));
        if (partial.length > 0) {
            console.log(`  Partial matches: ${partial.map(p => p.n).join(', ')}`);
        }
    }
});
