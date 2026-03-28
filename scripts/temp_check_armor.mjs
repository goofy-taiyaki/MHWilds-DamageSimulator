
import { ARMOR } from '../js/data/armor.js';
const found = ARMOR.filter(a => a.gs.includes("毛皮の"));
found.forEach(a => console.log(a.n, ":", a.gs));
const set = new Set(found.map(a => a.gs));
console.log("Unique GS:", Array.from(set).map(s => s + " (" + Buffer.from(s).toString('hex') + ")"));

