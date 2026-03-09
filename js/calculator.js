import { SHARPNESS } from './data.js';

/**
 * Enhanced Calculator Logic supporting Restoration Bonuses and Monster Hitzones
 */
export class MHWCalculator {
    constructor() {
        this.baseAttack = 0;
        this.baseAffinity = 0;
        this.weaponType = 'gs';
        this.weaponCat = 'sever'; // sever, blunt, ammo
        this.skills = {}; // { skillId: level }
        this.sharpness = 'blue';
        this.motionValue = 100;
        this.motionElementMod = 1.0;
        this.partMod = 1.0;

        // Artia specifics
        this.excitation = { attack: 0, affinity: 0, element: 0 };
        this.restorationParts = []; // Array of up to 3 part objects
        this.restorationBonuses = []; // Array of bonus objects

        // Element specifics
        this.elementType = 'none';
        this.elementValue = 0;

        // Monster specifics
        this.hitzone = { sever: 0, blunt: 0, ammo: 0, fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 };
        this.currentMotionName = '';
    }

    reset() {
        this.baseAttack = 0;
        this.baseAffinity = 0;
        this.skills = {};
        this.sharpness = 'blue';
        this.motionValue = 100;
        this.excitation = { attack: 0, affinity: 0, element: 0 };
        this.restorationParts = [];
        this.restorationBonuses = [];
        this.elementType = 'none';
        this.elementValue = 0;
        this.hitzone = { sever: 0, blunt: 0, ammo: 0, fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 };
    }

    setWeapon(weapon, typeData) {
        this.baseAttack = weapon.attack;
        this.baseAffinity = weapon.affinity;
        this.weaponType = typeData.id;
        this.weaponCat = typeData.type;
    }

    setMotionValue(mv) {
        this.motionValue = mv;
    }

    _getMotionValueArray() {
        if (Array.isArray(this.motionValue)) return this.motionValue;
        if (typeof this.motionValue === 'number') return [this.motionValue];
        if (typeof this.motionValue === 'string') {
            const parts = this.motionValue.replace(/[^\d.+,]/g, '').split(/[+,]/);
            const vals = parts.map(p => parseFloat(p)).filter(n => !isNaN(n));
            return vals.length > 0 ? vals : [100];
        }
        return [100];
    }

    _getElementModArray(expectedLength) {
        if (Array.isArray(this.motionElementMod)) {
            let res = [...this.motionElementMod];
            while (res.length < expectedLength) res.push(res[res.length - 1] || 1.0);
            return res;
        } else if (typeof this.motionElementMod === 'number' && !isNaN(this.motionElementMod)) {
            return Array(expectedLength).fill(this.motionElementMod);
        }
        return Array(expectedLength).fill(1.0);
    }

    setRestorationParts(parts) {
        this.restorationParts = parts;
    }

    setRestorationBonuses(bonuses) {
        this.restorationBonuses = bonuses;
    }

    setExcitation(excitation) {
        this.excitation = excitation;
    }

    setElement(type, value) {
        this.elementType = type;
        this.elementValue = value;
    }

    setSkillLevel(skillId, level) {
        this.skills[skillId] = level;
    }

    setMotion(mv, elemMod, partMod = 1.0, name = '') {
        this.motionValue = mv;
        this.motionElementMod = elemMod || 1.0;
        this.partMod = partMod || 1.0;
        this.currentMotionName = name || '';
    }

    setHitzone(hitzone) {
        this.hitzone = hitzone;
    }

    setBuffs(buffs) {
        this.buffs = buffs;
    }

    calculateStats(allSkillsData) {
        // --- 1. Base Multipliers and Additions ---
        let currentAttack = this.baseAttack + (this.excitation.attack || 0);
        let currentAffinity = this.baseAffinity + (this.excitation.affinity || 0);
        let currentElement = this.elementValue + (this.excitation.element || 0);

        this.restorationParts.forEach(p => {
            if (p) {
                currentAttack += p.attack || 0;
                currentAffinity += p.affinity || 0;
            }
        });

        this.restorationBonuses.forEach(b => {
            if (b.attack) currentAttack += b.attack;
            if (b.affinity) currentAffinity += b.affinity;
            if (b.group === 'elem') currentElement += b.value;
        });

        let finalAffinity = currentAffinity;
        let critDamageMult = 1.25;
        let physicalMultiplier = 1.0;
        let skillAttackAdd = 0;
        let buffAttackAdd = 0;
        let buffMultiplier = 1.0;
        let elementMultiplier = 1.0;
        let elementAddBonus = 0;
        let elementCritMultiplier = 1.0;

        // Buffs
        if (this.buffs) {
            this.buffs.forEach(b => {
                if (b.attack) buffAttackAdd += b.attack;
                if (b.multiplier) buffMultiplier *= b.multiplier;
                if (b.affinity) finalAffinity += b.affinity;
            });
        }

        // --- 2. Skill Application ---
        for (const [skillId, level] of Object.entries(this.skills)) {
            if (level <= 0) continue;
            if (skillId === 'weakness_exploit') continue;

            const skillData = allSkillsData.find(s => s.id === skillId);
            if (!skillData) continue;

            const currentLevel = Math.min(level, skillData.maxLevel);
            let effect = null;

            if (skillData.weaponSpecific && skillData.weaponEffects) {
                const weaponEffects = skillData.weaponEffects[this.weaponType];
                if (weaponEffects) {
                    effect = weaponEffects.find(e => e.level === currentLevel);
                }
            } else {
                effect = skillData.effects.find(e => e.level === currentLevel);
            }

            if (effect) {
                if (effect.attackAdd) skillAttackAdd += effect.attackAdd;
                if (effect.attackMult) {
                    if (skillId === 'airborne') {
                        // 飛燕 (Airborne boost 1.1x) - Updated based on Wilds specs
                        const jumpKeywords = ['ジャンプ', '落下', '飛燕', '空中', '兜割', '急襲', '騎乗', '下乗', '飛天', '飛翔', '飛円', 'フォール', '駆け上がり', '螺旋', '飛び込み突き'];
                        let isJumpAttack = jumpKeywords.some(key => this.currentMotionName.includes(key));

                        // Specific weapon+motion combos from official info
                        if (!isJumpAttack) {
                            if (this.weaponType === 'sns' && this.currentMotionName.includes('溜め斬り')) isJumpAttack = true;
                            if (this.weaponType === 'cb' && this.currentMotionName.includes('集中二連斬り')) isJumpAttack = true;
                            if (this.weaponType === 'sa' && this.currentMotionName.includes('強化叩きつけ')) isJumpAttack = true;
                        }

                        if (isJumpAttack) {
                            physicalMultiplier *= (1 + effect.attackMult);
                        }
                    } else {
                        physicalMultiplier *= (1 + effect.attackMult);
                    }
                }
                if (effect.affinity) finalAffinity += effect.affinity;
                if (effect.critMultAdd) critDamageMult += effect.critMultAdd;

                const canApplyElement = !skillData.requiresElement ||
                    skillData.requiresElement === this.elementType ||
                    (skillData.requiresElement === 'any_element' && this.elementType && this.elementType !== 'none');
                if (canApplyElement) {
                    if (effect.elementAdd) elementAddBonus += effect.elementAdd;
                    if (effect.elementMult) elementMultiplier *= (1 + effect.elementMult);
                    if (effect.elementCritMult) elementCritMultiplier += effect.elementCritMult;
                }
            }
        }

        // Final Multiplied Stats (武器倍率 / 属性値)
        // 1. 基底攻撃力にスキルの乗算補正を適用
        let attackStep = (currentAttack * physicalMultiplier);

        // 2. スキルとアイテムの加算補正を合計
        let totalFlatAttack = skillAttackAdd + buffAttackAdd;

        // 3. 乗算補正（旋律など）を最終的に適用
        const weaponMultiplier = (attackStep + totalFlatAttack) * buffMultiplier;

        const finalElement = (currentElement * elementMultiplier) + elementAddBonus;

        // Weakness Exploit
        const targetHz = this.hitzone[this.weaponCat] || 0;
        if (targetHz >= 45 && this.skills['weakness_exploit'] > 0) {
            const weData = allSkillsData.find(s => s.id === 'weakness_exploit');
            const weLevel = Math.min(this.skills['weakness_exploit'], weData.maxLevel);
            const weEffect = weData.effects.find(e => e.level === weLevel);
            if (weEffect) finalAffinity += weEffect.affinity;
        }
        const displayAffinity = finalAffinity; // 表示用（100%超を許容）
        const calcAffinity = Math.min(100, Math.max(-100, finalAffinity)); // 計算用（上限100%）

        // --- 3. Damage Calculation (Supporting Multihit) ---
        const isAmmo = this.weaponCat === 'ammo';
        const sharpnessData = SHARPNESS[this.sharpness];

        // Specific correction factors (Future extension)
        const weaponMod = 1.0;      // 遠距離：武器補正 (弾種・距離補正等)
        const rapidFireMod = 1.0;   // 遠距離：速射等の補正
        const meleeElemMod = 1.0;   // 近接：属性補正

        // Precision definition: Round to one decimal place immediately for each component
        const round1 = (val) => Math.round(val * 10) / 10;

        const mvs = this._getMotionValueArray();
        const elems = this._getElementModArray(mvs.length);

        let physNormal = 0;
        let physCrit = 0;
        let elemNormal = 0;
        let elemCrit = 0;

        const calcPhys = (critMod, mv) => {
            if (isAmmo) {
                return (weaponMultiplier * mv * critMod * weaponMod * targetHz) / 10000;
            } else {
                return (weaponMultiplier * mv * sharpnessData.raw * critMod * targetHz) / 10000;
            }
        };

        const elementHz = this.hitzone[this.elementType] || 0;
        const calcElem = (eCritMod, hitElemMod) => {
            // Use hitElemMod as the primary multiplier for the action
            if (isAmmo) {
                return (finalElement * hitElemMod * rapidFireMod * elementHz * eCritMod) / 1000;
            } else {
                return (finalElement * hitElemMod * sharpnessData.element * meleeElemMod * elementHz * eCritMod) / 1000;
            }
        };

        mvs.forEach((mv, i) => {
            physNormal += round1(calcPhys(1.0, mv));
            physCrit += round1(calcPhys(calcAffinity < 0 ? 0.75 : critDamageMult, mv));

            if (this.elementType !== 'none') {
                // モーション値が0の場合は属性ダメージも0にする
                if (mv > 0) {
                    elemNormal += round1(calcElem(1.0, elems[i]));
                    elemCrit += round1(calcElem(calcAffinity < 0 ? 1.0 : elementCritMultiplier, elems[i]));
                }
            }
        });

        // --- 4. Totals and Expectations ---
        const totalNormal = physNormal + elemNormal;
        const totalCrit = physCrit + elemCrit;

        // Expected Value Calculation
        const critRate = Math.max(0, calcAffinity) / 100;
        const feebleRate = calcAffinity < 0 ? Math.abs(calcAffinity) / 100 : 0;

        // Expected = (TotalNormal * ProbNormal) + (TotalCrit * ProbCrit) + (TotalFeeble * ProbFeeble)
        const expectedDamage = (totalNormal * (1 - critRate - feebleRate)) + (totalCrit * critRate) + (physCrit + elemNormal) * feebleRate;
        // NOTE: For negative affinity, physical becomes 0.75 (physCrit), element stays same.

        return {
            baseAttack: currentAttack,
            baseElement: currentElement,
            baseAffinity: currentAffinity,
            displayAttack: Math.floor(weaponMultiplier),
            displayElement: Math.floor(finalElement),
            affinity: displayAffinity,

            // Per Hit Damage (Displays)
            physicalDamageNormal: physNormal.toFixed(1),
            elementalDamageNormal: elemNormal.toFixed(1),
            totalDamageNormal: totalNormal.toFixed(1),

            physicalDamageCrit: physCrit.toFixed(1),
            elementalDamageCrit: elemCrit.toFixed(1),
            totalDamageCrit: totalCrit.toFixed(1),

            expectedDamage: expectedDamage.toFixed(1),

            hitzoneValue: targetHz,
            elementHitzone: this.elementType !== 'none' ? this.hitzone[this.elementType] : 0
        };
    }
}
