import { BONUSES, bonusLimit, legalBonuses } from './asst_weapon.js';
import { MHWCalculator } from '../calculator.js';
import {
    WEAPON_TYPES, WEAPONS, SKILLS, MONSTERS, MOTION_VALUES,
    EXCITATION_DATA, RESTORATION_PARTS, RESTORATION_BONUSES, BUFF_GROUPS
} from '../data.js';

/**
 * Artia構成の最適解を探索するモジュール
 */
function* artiaSearch(state) {
    const {
        weaponTypeId,
        excitationType,
        elementType,
        baseElementVal,
        monsterName,
        hitzonePartIndex,
        currentSkillLevels,
        motionValue,
        motionElementMod,
        motionName,
        sharpness,
        locks,
        buffStates
    } = state;

    const typeData = WEAPON_TYPES.find(t => t.id === weaponTypeId);
    const weapon = WEAPONS.find(w => w.type === weaponTypeId);
    const hitzone = (monsterName && hitzonePartIndex !== "") ? MONSTERS[monsterName]?.parts?.[hitzonePartIndex] : null;

    const validExcitations = ['attack', 'affinity', 'element'];
    const fixedParts = state.lockSlots?.parts ? state.parts.filter((id,i)=>state.lockSlots.parts[i]) : locks.parts;
    const fixedBonuses = state.lockSlots?.bonuses ? state.bonuses.filter((id,i)=>state.lockSlots.bonuses[i]) : locks.bonuses;
    const noneParts = fixedParts.filter(id=>id==='none').length;
    const noneBonuses = fixedBonuses.filter(id=>id==='none').length;
    const validParts = RESTORATION_PARTS.filter(p => p.id !== 'none' || noneParts>0);
    const validBonuses = BONUSES.filter(b => (b.id !== 'none' || noneBonuses>0) && (!['lbg','hbg'].includes(weaponTypeId) || b.group !== 'elem'));

    // 生成：パーツの全組み合わせ（同一パーツの重複あり、順不同3枠）
    const partCombos = [];
    for (let i = 0; i < validParts.length; i++) {
        for (let j = i; j < validParts.length; j++) {
            for (let k = j; k < validParts.length; k++) {
                partCombos.push([validParts[i], validParts[j], validParts[k]]);
            }
        }
    }

    // 生成：ボーナスの全組み合わせ（同一ボーナスは2つまで、計5枠）
    const bonusCombos = [];
    function generateBonuses(combo, index) {
        if (combo.length === 5) {
            if(legalBonuses(combo))bonusCombos.push([...combo]);
            return;
        }
        if (index >= validBonuses.length) return;

        const remainingNeeded = 5 - combo.length;
        const possibleFromRest = (validBonuses.length - index) * 5;
        if (possibleFromRest < remainingNeeded) return;

        for (let count = 0; count <= bonusLimit(validBonuses[index]); count++) {
            if (combo.length + count <= 5) {
                for (let c = 0; c < count; c++) combo.push(validBonuses[index]);
                generateBonuses(combo, index + 1);
                for (let c = 0; c < count; c++) combo.pop();
            }
        }
    }
    generateBonuses([], 0);

    function satisfiesRequirements(combo, requirements) {
        const counts = {};
        for (const item of combo) {
            counts[item.id] = (counts[item.id] || 0) + 1;
        }
        const reqCounts = {};
        for (const req of requirements) {
            reqCounts[req] = (reqCounts[req] || 0) + 1;
        }
        for (const key of Object.keys(reqCounts)) {
            if ((counts[key] || 0) < reqCounts[key]) return false;
        }
        return true;
    }

    // 固定項目のフィルタリング
    const requiredExcitations = locks.excitation ? [excitationType] : validExcitations;
    const filteredPartCombos = partCombos.filter(c => satisfiesRequirements(c, fixedParts) && c.filter(p=>p.id==='none').length===noneParts);
    const filteredBonusCombos = bonusCombos.filter(c => satisfiesRequirements(c, fixedBonuses) && c.filter(b=>b.id==='none').length===noneBonuses);

    function restoreFixedPositions(ids, original, fixed) {
        if (!fixed) return ids;
        const remaining=[...ids],result=Array(ids.length);
        fixed.forEach((locked,i)=>{
            if(!locked)return;
            const index=remaining.indexOf(original[i]);
            if(index>=0){result[i]=remaining[index];remaining.splice(index,1);}
        });
        return Array.from({length:ids.length},(_,i)=>result[i]??remaining.shift());
    }

    let maxExpectedDamage = -1;
    let optimalConfig = null;

    const tempCalc = new MHWCalculator();

    // バフの事前算出（全ループで共通のため）
    const selectedBuffs = [];
    if (buffStates) {
        BUFF_GROUPS.forEach(group => {
            const val = buffStates[group.id];
            if (val && val !== 'none') {
                if (Array.isArray(val)) {
                    val.forEach(vid => {
                        const buff = group.buffs.find(b => b.id === vid);
                        if (buff) selectedBuffs.push(buff);
                    });
                } else {
                    const buff = group.buffs.find(b => b.id === val);
                    if (buff) selectedBuffs.push(buff);
                }
            }
        });
    }

    let evaluated = 0;
    for (const exci of requiredExcitations) {
        const exciData = (EXCITATION_DATA[weaponTypeId] && EXCITATION_DATA[weaponTypeId][exci])
            ? EXCITATION_DATA[weaponTypeId][exci]
            : { attack: 0, affinity: 0, element: 0 };

        for (const pCombo of filteredPartCombos) {
            for (const bCombo of filteredBonusCombos) {
                if (++evaluated % 32 === 0) yield;
                tempCalc.reset();
                if (weapon && typeData) tempCalc.setWeapon(weapon, typeData);
                tempCalc.setExcitation(exciData);
                tempCalc.setRestorationParts(pCombo);
                tempCalc.setRestorationBonuses(bCombo);
                tempCalc.setElement(elementType, baseElementVal);
                if (hitzone) tempCalc.setHitzone(hitzone);

                Object.keys(currentSkillLevels).forEach(id => {
                    tempCalc.setSkillLevel(id, currentSkillLevels[id]);
                });

                tempCalc.setMotionValue(motionValue);
                tempCalc.sharpness = sharpness;
                tempCalc.setMotion(motionValue, motionElementMod, state.motionPartMod || 1.0, motionName);
                tempCalc.setBowgunSettings(state.bowgunSettings);
                tempCalc.setWeaponSpecificParameters(state.weaponSpecificParams);
                tempCalc.setBuffs(selectedBuffs);

                const res = tempCalc.calculateStats(SKILLS);
                const expectedVal = parseFloat(res.expectedDamage); // res.expectedDamage は string なのでパースする

                if (expectedVal > maxExpectedDamage) {
                    maxExpectedDamage = expectedVal;
                    optimalConfig = {
                        excitation: exci,
                        parts: restoreFixedPositions(pCombo.map(p => p.id),state.parts,state.lockSlots?.parts),
                        bonuses: restoreFixedPositions(bCombo.map(b => b.id),state.bonuses,state.lockSlots?.bonuses),
                        expectedDamageString: res.expectedDamage
                    };
                }
            }
        }
    }

    return optimalConfig;
}


export function findOptimalArtiaConfiguration(state) {
    const search=artiaSearch(state);
    let step;
    do { step=search.next(); } while(!step.done);
    return step.value;
}

export async function findOptimalArtiaConfigurationAsync(state, {isCancelled=()=>false, sliceMs=12}={}) {
    const search=artiaSearch(state);
    while(true) {
        if(isCancelled()) { search.return();return null; }
        const start=performance.now();let step;
        do { step=search.next();if(step.done)return step.value; } while(performance.now()-start<sliceMs);
        await new Promise(resolve=>setTimeout(resolve,0));
    }
}
