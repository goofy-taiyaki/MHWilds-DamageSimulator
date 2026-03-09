import { TALISMAN_GROUPS, TALISMAN_SLOTS, TALISMAN_COMBINATIONS } from './data/talisman.js';

function generateAllCombinations() {
    console.log("Generating combinations...");
    const results = { 5: [], 6: [], 7: [], 8: [] };

    TALISMAN_COMBINATIONS.forEach(pattern => {
        const { rare, s1, s2, s3 } = pattern;
        const g1 = TALISMAN_GROUPS[s1] || [];
        const g2 = TALISMAN_GROUPS[s2] || [];
        const g3 = s3 ? (TALISMAN_GROUPS[s3] || []) : [null]; // If s3 is null, use a single null entry for loop
        const slots = TALISMAN_SLOTS[`RARE${rare}`] || [];

        for (const skill1 of g1) {
            for (const skill2 of g2) {
                for (const skill3 of g3) {
                    for (const slot of slots) {
                        const entry = {
                            s1: skill1,
                            s2: skill2,
                            s3: skill3,
                            slot: slot
                        };
                        results[rare].push(entry);
                    }
                }
            }
        }
    });

    return results;
}

const allCombinations = generateAllCombinations();
Object.keys(allCombinations).forEach(rare => {
    console.log(`RARE ${rare}: ${allCombinations[rare].length} combinations`);
    // Note: Writing this many to a variable/file directly might be too large for JS engine memory in one go if extremely large.
    // But let's check the scale.
});
