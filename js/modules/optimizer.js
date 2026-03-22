import { MHWCalculator } from '../calculator.js';
import {
    WEAPON_TYPES, WEAPONS, SKILLS, MONSTERS, MOTION_VALUES,
    EXCITATION_DATA, RESTORATION_PARTS, RESTORATION_BONUSES, BUFF_GROUPS
} from '../../data.js';

/**
 * Artia構成の最適解を探索するモジュール
 */
export function findOptimalArtiaConfiguration(state) {
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
    const hitzone = (monsterName && hitzonePartIndex !== "") ? MONSTERS[monsterName].parts[hitzonePartIndex] : null;

    const validExcitations = ['attack', 'affinity', 'element'];
    const validParts = RESTORATION_PARTS.filter(p => p.id !== 'none');
    const validBonuses = RESTORATION_BONUSES.filter(b => b.id !== 'none');

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
            bonusCombos.push([...combo]);
            return;
        }
        if (index >= validBonuses.length) return;

        const remainingNeeded = 5 - combo.length;
        const possibleFromRest = (validBonuses.length - index) * 2;
        if (possibleFromRest < remainingNeeded) return;

        for (let count = 0; count <= 2; count++) {
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
    const filteredPartCombos = partCombos.filter(c => satisfiesRequirements(c, locks.parts));
    const filteredBonusCombos = bonusCombos.filter(c => satisfiesRequirements(c, locks.bonuses));

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

    for (const exci of requiredExcitations) {
        const exciData = (EXCITATION_DATA[weaponTypeId] && EXCITATION_DATA[weaponTypeId][exci])
            ? EXCITATION_DATA[weaponTypeId][exci]
            : { attack: 0, affinity: 0, element: 0 };

        for (const pCombo of filteredPartCombos) {
            for (const bCombo of filteredBonusCombos) {
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
                        parts: pCombo.map(p => p.id),
                        bonuses: bCombo.map(b => b.id),
                        expectedDamageString: res.expectedDamage
                    };
                }
            }
        }
    }

    return optimalConfig;
}
