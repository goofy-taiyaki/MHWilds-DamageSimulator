import { SHARPNESS, BOWGUN_CORRECTIONS } from '../data.js';

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

        // Bowgun specifics
        this.bowgunSettings = {
            rapidFire: false,
            chaseShot: false
        };
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
        this.bowgunSettings = { rapidFire: false, chaseShot: false };
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

    setBowgunSettings(settings) {
        this.bowgunSettings = settings || { rapidFire: false, chaseShot: false };
    }

    setWeaponSpecificParameters(params) {
        this.weaponSpecifics = params || {
            dbDemonMode: false,
            lsSpiritGauge: 'none',
            saPhialType: 'none',
            igExtract: 'none'
        };
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

            // ボウガン専用スキルの判定 (First Shot, Force Shot)
            if ((skillId === 'force_shot' || skillId === 'first_shot') && !['lbg', 'hbg'].includes(this.weaponType)) {
                continue;
            }

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
                    } else if (skillId === 'normal_up' || skillId === 'pierce_up' || skillId === 'spread_up') {
                        const name = this.currentMotionName;
                        let targetAmmo = 'other';
                        if (name.includes('通常弾')) targetAmmo = 'normal';
                        else if (name.includes('貫通弾')) targetAmmo = 'pierce';
                        else if (name.includes('散弾')) targetAmmo = 'spread';

                        const isMatch = (skillId === 'normal_up' && targetAmmo === 'normal') ||
                            (skillId === 'pierce_up' && targetAmmo === 'pierce') ||
                            (skillId === 'spread_up' && targetAmmo === 'spread');

                        if (isMatch) {
                            physicalMultiplier *= (1 + effect.attackMult);
                        }
                    } else if (skillId === 'rapid_fire_up_lbg') {
                        // 速射強化: 速射時のみ適用
                        if (this.bowgunSettings.rapidFire) {
                            physicalMultiplier *= (1 + effect.attackMult);
                        }
                    } else if (skillId === 'minds_eye') {
                        // 心眼: 物理肉質が44以下の場合に物理乗算を適用
                        const targetHz = this.hitzone[this.weaponCat] || 0;
                        if (targetHz <= 44) {
                            physicalMultiplier *= (1 + effect.attackMult);
                        }
                    } else if (skillId === 'skill_ex0i8v') {
                        // 鈍器使い: Lv1/2は黄以下、Lv3は緑以下で発動
                        const s = this.sharpness;
                        let apply = false;
                        if ((currentLevel === 1 || currentLevel === 2) && ['yellow', 'orange', 'red'].includes(s)) apply = true;
                        else if (currentLevel === 3 && ['green', 'yellow', 'orange', 'red'].includes(s)) apply = true;

                        if (apply) {
                            physicalMultiplier *= (1 + effect.attackMult);
                        }
                    } else if (skillId === 'skill_fzddcu') {
                        // 特殊射撃強化: ボウガン・弓の特定アクションのみ適用
                        const specKeywords = ['竜熱', '圧着竜弾', '起爆竜弾', '竜の一矢', '竜の千々矢', '導ノ矢'];
                        if (specKeywords.some(k => this.currentMotionName.includes(k))) {
                            physicalMultiplier *= (1 + effect.attackMult);
                        }
                    } else if (skillId === 'skill_y6j609') {
                        // 高速変形: スラッシュアックス・チャージアックスの変形アクションのみ適用
                        if ((this.weaponCat === 'sa' || this.weaponCat === 'cb') && this.currentMotionName.includes('変形')) {
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
                    if (effect.elementMult) {
                        if (skillId === 'skill_2utnlo') { // チャージマスター
                            const chargeKeywords = ['溜め', '溜', 'チャージ', '剛射', '剛連射', '急襲'];
                            if (chargeKeywords.some(k => this.currentMotionName.includes(k))) {
                                elementMultiplier *= (1 + effect.elementMult);
                            }
                        } else {
                            elementMultiplier *= (1 + effect.elementMult);
                        }
                    }
                    if (effect.elementCritMult) elementCritMultiplier += effect.elementCritMult;
                }
            }
        }
        // 1. 乗算補正の集計 (スキル、旋律、武器固有)
        let totalPhysicalMultiplier = physicalMultiplier * buffMultiplier;
        let totalElementMultiplier = elementMultiplier;

        if (this.weaponSpecifics) {
            // 双剣: 鬼人化 1.2倍
            if (this.weaponType === 'db' && this.weaponSpecifics.dbDemonMode) {
                totalPhysicalMultiplier *= 1.2;
            }
            // 太刀: 気刃ゲージ
            if (this.weaponType === 'ls') {
                if (this.weaponSpecifics.lsSpiritGauge === 'white') totalPhysicalMultiplier *= 1.02;
                else if (this.weaponSpecifics.lsSpiritGauge === 'yellow') totalPhysicalMultiplier *= 1.04;
                else if (this.weaponSpecifics.lsSpiritGauge === 'red') totalPhysicalMultiplier *= 1.10;
            }
            // スラッシュアックス: ビン補正
            if (this.weaponType === 'sa') {
                if (this.weaponSpecifics.saPhialType === 'power') totalPhysicalMultiplier *= 1.17;
                else if (this.weaponSpecifics.saPhialType === 'element') totalElementMultiplier *= 1.45;
            }
            // 操虫棍: エキス補正
            if (this.weaponType === 'ig') {
                if (this.weaponSpecifics.igExtract === 'red_white') totalPhysicalMultiplier *= 1.10;
                else if (this.weaponSpecifics.igExtract === 'red_white_orange') totalPhysicalMultiplier *= 1.15;
            }
        }

        // 2. 最終攻撃力/属性値の算出
        // ダメージ計算用 (calc): 精度を保つため、表示用の切り捨てを行う前の生の値を使用
        const calcAttack = (currentAttack * totalPhysicalMultiplier) + skillAttackAdd + buffAttackAdd;
        const calcElement = (currentElement * totalElementMultiplier) + elementAddBonus;

        // UI表示用 (display): ゲームのステータス画面に合わせるための切り捨て
        const displayAttackValue = Math.floor(currentAttack * totalPhysicalMultiplier) + skillAttackAdd + buffAttackAdd;
        const displayElementValue = Math.floor(currentElement * totalElementMultiplier) + elementAddBonus;

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

        // Specific correction factors (Updated with Bowgun Corrections)
        let bowgunPhysMult = 1.0;
        let bowgunElemMult = 1.0;

        if (isAmmo) {
            let ammoType = 'other';
            const name = this.currentMotionName;
            if (name.includes('通常弾')) ammoType = 'normal';
            else if (name.includes('貫通弾')) ammoType = 'pierce';
            else if (name.includes('散弾')) ammoType = 'spread';
            else if (name.includes('属性弾')) ammoType = 'element';
            else if (name.includes('滅龍弾')) ammoType = 'dragon';
            else if (name.includes('徹甲榴弾')) ammoType = 'sticky';
            else if (name.includes('斬裂弾')) ammoType = 'slash';

            // LBG inherent multiplier
            if (this.weaponType === 'lbg' && BOWGUN_CORRECTIONS.lbg_base[ammoType]) {
                bowgunPhysMult *= BOWGUN_CORRECTIONS.lbg_base[ammoType];
                if (ammoType === 'element' || ammoType === 'dragon' || ammoType === 'sticky' || ammoType === 'slash') {
                    bowgunElemMult *= BOWGUN_CORRECTIONS.lbg_base[ammoType];
                }
            }

            const rf = this.bowgunSettings.rapidFire;
            const cs = this.bowgunSettings.chaseShot;

            let corr = null;
            if (rf && cs) corr = BOWGUN_CORRECTIONS.rapid_chase[ammoType];
            else if (rf) corr = BOWGUN_CORRECTIONS.rapid_fire[ammoType];
            else if (cs) corr = BOWGUN_CORRECTIONS.chase_shot[ammoType];

            if (corr) {
                if (typeof corr === 'number') {
                    bowgunPhysMult *= corr;
                    bowgunElemMult *= corr;
                } else {
                    if (corr.phys) bowgunPhysMult *= corr.phys;
                    if (corr.elem) bowgunElemMult *= corr.elem;
                }
            }
        }

        const weaponMod = 1.0 * bowgunPhysMult;      // 遠距離：武器補正 (弾種・距離補正等)
        const rapidFireMod = 1.0 * bowgunElemMult;   // 遠距離：速射等の補正
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
                return (calcAttack * mv * critMod * weaponMod * targetHz) / 10000;
            } else {
                return (calcAttack * mv * sharpnessData.raw * critMod * targetHz) / 10000;
            }
        };

        const elementHz = this.hitzone[this.elementType] || 0;
        const calcElem = (eCritMod, hitElemMod) => {
            // Use hitElemMod as the primary multiplier for the action
            if (isAmmo) {
                return (calcElement * hitElemMod * rapidFireMod * elementHz * eCritMod) / 1000;
            } else {
                return (calcElement * hitElemMod * sharpnessData.element * meleeElemMod * elementHz * eCritMod) / 1000;
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

        const hitDetails = mvs.map((mv, i) => {
            const pNorm = round1(calcPhys(1.0, mv));
            const pCrit = round1(calcPhys(calcAffinity < 0 ? 0.75 : critDamageMult, mv));
            const eNorm = (this.elementType !== 'none' && mv > 0) ? round1(calcElem(1.0, elems[i])) : 0;
            const eCrit = (this.elementType !== 'none' && mv > 0) ? round1(calcElem(calcAffinity < 0 ? 1.0 : elementCritMultiplier, elems[i])) : 0;

            return {
                physicalNormal: pNorm.toFixed(1),
                physicalCrit: pCrit.toFixed(1),
                elementalNormal: eNorm.toFixed(1),
                elementalCrit: eCrit.toFixed(1),
                totalNormal: (pNorm + eNorm).toFixed(1),
                totalCrit: (pCrit + eCrit).toFixed(1)
            };
        });

        return {
            baseAttack: currentAttack, // 武器基礎ステータス用: 武器本来+激化+復元 (整数)
            baseElement: currentElement,
            baseAffinity: currentAffinity,
            displayAttack: displayAttackValue, // 参照ステータス用: スキル・バフ適用後 (切り捨て済)
            displayElement: displayElementValue,
            affinity: displayAffinity,

            // Per Hit Damage (Displays) - 精度の高い calcAttack / calcElement を内部で使用した結果
            physicalDamageNormal: physNormal.toFixed(1),
            elementalDamageNormal: elemNormal.toFixed(1),
            totalDamageNormal: totalNormal.toFixed(1),

            physicalDamageCrit: physCrit.toFixed(1),
            elementalDamageCrit: elemCrit.toFixed(1),
            totalDamageCrit: totalCrit.toFixed(1),

            expectedDamage: expectedDamage.toFixed(1),

            hitzoneValue: targetHz,
            elementHitzone: this.elementType !== 'none' ? this.hitzone[this.elementType] : 0,
            hits: hitDetails
        };
    }
}
