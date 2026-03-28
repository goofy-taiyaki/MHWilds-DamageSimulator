const fs = require('fs');

async function merge() {
    const path = require('path');
    const rootDir = path.resolve(__dirname, '..');
    const existingContent = fs.readFileSync(path.join(rootDir, 'js/data/skills.js'), 'utf8');
    const arrayMatch = existingContent.match(/\[[\s\S]*\]/);
    if (!arrayMatch) throw new Error("Could not find array in skills.js");
    const existingSkillsRaw = eval(arrayMatch[0]);
    
    const newFile = 'C:/Users/tai_r/.gemini/antigravity/brain/8cffc39f-96aa-4c46-b045-98c43a564a63/browser/scratchpad_i8dc763i.md';
    let newRawText = fs.readFileSync(newFile, 'utf8');
    // Clean up SKILLS_END
    newRawText = newRawText.replace(/SKILLS_END/g, '').trim();
    const newSkillsRaw = JSON.parse(newRawText);

    const DAMAGE_FIELDS = ['attackAdd', 'attackMult', 'affinity', 'elementAdd', 'elementMult'];

    const finalSkills = [];
    const processedNames = new Set();

    existingSkillsRaw.forEach(s => {
        const name = s.name;
        const newS = newSkillsRaw.find(ns => ns.name === name);
        
        if (newS) {
            s.maxLevel = newS.maxLevel || s.maxLevel;
            
            if (!s.weaponSpecific) {
                const newEffects = newS.levels.map(nl => {
                    const lvlInt = nl.level;
                    const effect = { level: lvlInt };
                    
                    if (nl.attackAdd) effect.attackAdd = nl.attackAdd;
                    if (nl.attackMult && nl.attackMult !== 1) {
                        if (name === '超会心') {
                            effect.critMultAdd = Math.round((nl.attackMult - 1.25) * 100) / 100;
                        } else {
                            effect.attackMult = Math.round((nl.attackMult - 1) * 100) / 100;
                        }
                    }
                    if (nl.affinity) effect.affinity = nl.affinity;
                    if (nl.elementAdd) effect.elementAdd = nl.elementAdd;
                    if (nl.elementMult && nl.elementMult !== 1) effect.elementMult = Math.round((nl.elementMult - 1) * 100) / 100;
                    
                    return effect;
                });
                s.effects = newEffects;
            }
        }
        finalSkills.push(s);
        processedNames.add(name);
    });

    newSkillsRaw.forEach(ns => {
        if (!processedNames.has(ns.name)) {
            const newId = 'skill_' + Math.random().toString(36).substr(2, 6);
            const newEffects = ns.levels.map(nl => {
                const lvlInt = nl.level;
                const effect = { level: lvlInt };
                
                if (nl.attackAdd) effect.attackAdd = nl.attackAdd;
                if (nl.attackMult && nl.attackMult !== 1) {
                   if (ns.name === '超会心') {
                        effect.critMultAdd = Math.round((nl.attackMult - 1.25) * 100) / 100;
                    } else {
                        effect.attackMult = Math.round((nl.attackMult - 1) * 100) / 100;
                    }
                }
                if (nl.affinity) effect.affinity = nl.affinity;
                if (nl.elementAdd) effect.elementAdd = nl.elementAdd;
                if (nl.elementMult && nl.elementMult !== 1) effect.elementMult = Math.round((nl.elementMult - 1) * 100) / 100;
                
                return effect;
            });
            
            finalSkills.push({
                id: newId,
                name: ns.name,
                mainCategory: 'armor',
                subCategory: 'utility',
                maxLevel: ns.maxLevel,
                effects: newEffects
            });
        }
    });

    const output = 'export const SKILLS = ' + JSON.stringify(finalSkills, null, 2) + ';';
    fs.writeFileSync(path.join(rootDir, 'js/data/skills.js'), output, 'utf8');
    console.log(`Merged ${finalSkills.length} skills total.`);
}

merge();

