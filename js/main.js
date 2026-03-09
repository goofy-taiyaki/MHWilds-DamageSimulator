import { WEAPON_TYPES, WEAPONS, SKILLS, SHARPNESS, RESTORATION_PARTS, RESTORATION_BONUSES, EXCITATION_DATA, EXCITATION_TYPES, MONSTERS, ELEMENT_TYPES, MOTION_VALUES, BUFF_GROUPS } from './data.js';
import { MHWCalculator } from './calculator.js';
import { findOptimalArtiaConfiguration as runOptimizer } from './modules/optimizer.js';
import { BuildShare } from './modules/share.js';

document.addEventListener('DOMContentLoaded', () => {
    const calc = new MHWCalculator();

    // UI Elements
    const weaponTypeSelect = document.getElementById('weapon-type-select');
    const excitationSelect = document.getElementById('excitation-select');
    const elementTypeSelect = document.getElementById('element-type-select');
    const motionValueInput = document.getElementById('target-motion-value-input');
    const elementModInput = document.getElementById('target-element-mod-input');
    const partSelects = document.querySelectorAll('.part-select');
    const bonusSelects = document.querySelectorAll('.bonus-select');
    const bonusWarning = document.getElementById('bonus-warning');
    const sharpnessSelect = document.getElementById('target-sharpness-select');
    const sharpnessContainer = document.getElementById('target-sharpness-container');
    const motionSelect = document.getElementById('motion-select');
    const skillsSelectionList = document.getElementById('skills-selection-list');
    const activeSkillsList = document.getElementById('active-skills-list');
    const activeSkillsCount = document.getElementById('active-skills-count');
    const cachedSkillSelects = {};

    // Buff UI
    const buffContainer = document.getElementById('buff-container');
    const cachedBuffSelects = {};

    // MySet UI
    const currentMySetDisplay = document.getElementById('current-myset-display');
    const btnOverwriteMySet = document.getElementById('btn-overwrite-myset');
    let currentLoadedMySetName = null;

    // Monster Elements
    const monsterSelect = document.getElementById('monster-select');
    const hitzoneSelect = document.getElementById('hitzone-select');
    const hitzoneDetailPanel = document.getElementById('hitzone-detail-panel');

    const attackDisplay = document.getElementById('display-attack');
    const displayElement = document.getElementById('display-element');
    const affinityDisplay = document.getElementById('display-affinity');

    const displayPhysDamageNormal = document.getElementById('display-phys-damage-normal');
    const displayElemDamageNormal = document.getElementById('display-elem-damage-normal');
    const displayTotalDamageNormal = document.getElementById('display-total-damage-normal');

    const displayPhysDamageCrit = document.getElementById('display-phys-damage-crit');
    const displayElemDamageCrit = document.getElementById('display-elem-damage-crit');
    const displayTotalDamageCrit = document.getElementById('display-total-damage-crit');

    const displayExpectedDamage = document.getElementById('display-expected-damage');

    const baseAtkDisplay = document.getElementById('base-atk-display');
    const baseElemDisplay = document.getElementById('base-elem-display');
    const baseAffDisplay = document.getElementById('base-aff-display');

    function init() {
        // Weapon Types
        WEAPON_TYPES.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type.id;
            opt.textContent = type.name;
            weaponTypeSelect.appendChild(opt);
        });

        // Excitation Types
        EXCITATION_TYPES.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type.id;
            opt.textContent = type.name;
            excitationSelect.appendChild(opt);
        });

        // Element Types
        ELEMENT_TYPES.forEach(el => {
            const opt = document.createElement('option');
            opt.value = el.id;
            opt.textContent = el.name;
            elementTypeSelect.appendChild(opt);
        });

        // Parts
        partSelects.forEach(select => {
            RESTORATION_PARTS.forEach(part => {
                const opt = document.createElement('option');
                opt.value = part.id;
                opt.textContent = part.name;
                select.appendChild(opt);
            });
            select.addEventListener('change', updateCalculation);
        });

        // Bonuses for all 5 slots
        bonusSelects.forEach(select => {
            RESTORATION_BONUSES.forEach(bonus => {
                const opt = document.createElement('option');
                opt.value = bonus.id;
                opt.textContent = bonus.name;
                select.appendChild(opt);
            });
            select.addEventListener('change', (e) => {
                // Systematic restriction: Max 2 same bonuses
                const selectedIds = Array.from(bonusSelects).map(s => s.value).filter(id => id !== 'none');
                const val = e.target.value;
                if (val !== 'none') {
                    const count = selectedIds.filter(id => id === val).length;
                    if (count > 2) {
                        alert('同じボーナスは2つまでしか選択できません。');
                        e.target.value = 'none';
                    }
                }
                updateCalculation();
            });
        });

        // Monsters
        Object.keys(MONSTERS).forEach(mName => {
            const opt = document.createElement('option');
            opt.value = mName;
            opt.textContent = mName;
            monsterSelect.appendChild(opt);
        });

        // Buffs
        if (buffContainer) {
            BUFF_GROUPS.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'input-group';
                groupDiv.style.marginBottom = '0.5rem';

                if (group.multi) {
                    groupDiv.style.gridColumn = '1 / -1'; // 横いっぱいに広げる
                    groupDiv.innerHTML = `
                        <label style="font-size: 0.7rem; color: #32cd32; display:block; margin-bottom:0.2rem;">${group.name}</label>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 0.6rem;">
                            ${group.buffs.map(b => `
                                <label style="display: flex; align-items: center; gap: 0.2rem; font-size: 0.7rem; cursor: pointer; white-space: nowrap;">
                                    <input type="checkbox" id="buff-${b.id}" data-group-id="${group.id}" value="${b.id}">
                                    ${b.name}
                                </label>
                            `).join('')}
                        </div>
                    `;
                    groupDiv.querySelectorAll('input').forEach(chk => {
                        chk.addEventListener('change', updateCalculation);
                    });
                } else {
                    groupDiv.innerHTML = `
                        <label style="font-size: 0.7rem; color: #32cd32;">${group.name}</label>
                        <select id="buff-${group.id}" data-group-id="${group.id}">
                            <option value="none">---</option>
                            ${group.buffs.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                        </select>
                    `;
                    const select = groupDiv.querySelector('select');
                    cachedBuffSelects[group.id] = select;
                    select.addEventListener('change', updateCalculation);
                }
                buffContainer.appendChild(groupDiv);
            });
        }

        // Skill Selectors by Main Category
        const MAIN_CATEGORY_NAMES = {
            weapon: '武器スキル',
            armor: '防具スキル',
            series: 'シリーズスキル',
            group: 'グループスキル'
        };

        const MAIN_CATEGORY_ORDER = ['weapon', 'armor', 'series', 'group'];

        MAIN_CATEGORY_ORDER.forEach(mainCat => {
            const catSkills = SKILLS.filter(s => s.mainCategory === mainCat);
            if (catSkills.length === 0) return;

            // Header for main category
            const mainHeader = document.createElement('div');
            mainHeader.className = 'skill-category-title main-category-header';
            mainHeader.textContent = MAIN_CATEGORY_NAMES[mainCat];
            mainHeader.style.marginTop = '1rem';
            mainHeader.style.fontWeight = 'bold';
            skillsSelectionList.appendChild(mainHeader);

            // Optional subcategory grouping (attack, affinity, element, or null) within each main category
            const subCategories = ['attack', 'affinity', 'element', null];
            subCategories.forEach(subCat => {
                const subSkills = catSkills.filter(s => s.subCategory === subCat);
                if (subSkills.length === 0) return;

                if (subCat !== null) {
                    const subHeader = document.createElement('div');
                    subHeader.className = 'skill-subcategory-title';
                    subHeader.textContent = subCat === 'attack' ? '攻撃力強化' : subCat === 'affinity' ? '会心率' : '属性・状態異常';
                    subHeader.style.gridColumn = '1 / -1';
                    subHeader.style.marginLeft = '0';
                    subHeader.style.marginTop = '1.2rem';
                    subHeader.style.marginBottom = '0.5rem';
                    subHeader.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                    subHeader.style.fontSize = '0.9rem';
                    skillsSelectionList.appendChild(subHeader);
                }

                subSkills.forEach(skill => {
                    const row = document.createElement('div');
                    row.className = 'skill-selector-row';
                    row.innerHTML = `
                        <div class="skill-name" title="${skill.name}">${skill.name}</div>
                        <select id="skill-${skill.id}" data-skill-id="${skill.id}">
                            ${Array.from({ length: skill.maxLevel + 1 }, (_, i) => `<option value="${i}">${i === 0 ? '---' : 'Lv.' + i}</option>`).join('')}
                        </select>
                    `;
                    skillsSelectionList.appendChild(row);
                    const selectEl = row.querySelector('select');
                    cachedSkillSelects[skill.id] = selectEl;
                    selectEl.addEventListener('change', updateCalculation);
                });
            });
        });

        // Listeners for Monster/Hitzone
        monsterSelect.addEventListener('change', () => {
            updateHitzoneOptions();
            updateCalculation();
        });
        hitzoneSelect.addEventListener('change', updateCalculation);

        weaponTypeSelect.addEventListener('change', () => {
            updateMotionOptions();
            updateGunnerUI();
            updateCalculation();
        });
        excitationSelect.addEventListener('change', updateCalculation);
        elementTypeSelect.addEventListener('change', () => {
            updateCalculation();
        });
        motionValueInput.addEventListener('input', updateCalculation);
        if (elementModInput) elementModInput.addEventListener('input', updateCalculation);
        sharpnessSelect.addEventListener('change', updateCalculation);

        // Set simulation defaults as requested
        monsterSelect.value = 'ゴグマジオス';
        updateHitzoneOptions();
        hitzoneSelect.value = '0'; // Head

        excitationSelect.value = 'attack';
        elementTypeSelect.value = 'dragon';

        partSelects.forEach(s => s.value = 'attack');

        bonusSelects[0].value = 'atk_ex';
        bonusSelects[1].value = 'atk_ex';
        bonusSelects[2].value = 'atk_3';
        bonusSelects[3].value = 'atk_3';
        bonusSelects[4].value = 'sharp_load_ex';
        const lockBonus5 = document.getElementById('lock-bonus-5');
        if (lockBonus5) lockBonus5.checked = true;

        // Explicitly reset all skills to 0 (---) using cache
        SKILLS.forEach(skill => {
            const select = cachedSkillSelects[skill.id];
            if (select) select.value = "0";
        });

        initMotions();

        // Initial update
        updateMotionOptions();
        updateGunnerUI();
        performCalculation(); // Execute immediately for initial load
    }

    let calcTimeout = null;
    function updateCalculation() {
        if (calcTimeout) clearTimeout(calcTimeout);
        calcTimeout = setTimeout(() => {
            performCalculation();
        }, 200); // 200ms debounce
    }

    function initMotions() {
        if (!motionSelect) return;

        motionSelect.addEventListener('change', () => {
            const weaponId = weaponTypeSelect.value;
            const motionId = motionSelect.value;

            if (motionId === 'custom') {
                motionValueInput.readOnly = false;
                if (elementModInput) elementModInput.readOnly = false;
                return;
            }

            const weaponMotions = MOTION_VALUES[weaponId];
            if (weaponMotions && weaponMotions[motionId]) {
                const motion = weaponMotions[motionId];
                motionValueInput.value = Array.isArray(motion.mv) ? motion.mv.join(', ') : motion.mv;
                motionValueInput.readOnly = true;
                if (elementModInput) {
                    elementModInput.value = Array.isArray(motion.elem) ? motion.elem.join(', ') : motion.elem;
                    elementModInput.readOnly = true;
                }
            }
            updateCalculation();
        });
    }

    function updateMotionOptions() {
        if (!motionSelect) return;

        const weaponId = weaponTypeSelect.value;
        const weaponMotions = MOTION_VALUES[weaponId] || [];

        // Clear existing except "custom"
        motionSelect.innerHTML = '<option value="custom">手入力</option>';

        weaponMotions.forEach((m, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = m.name;
            motionSelect.appendChild(opt);
        });

        // Default to first real motion if available
        if (weaponMotions.length > 0) {
            motionSelect.value = 0;
            const firstMotion = weaponMotions[0];
            motionValueInput.value = Array.isArray(firstMotion.mv) ? firstMotion.mv.join(', ') : firstMotion.mv;
            motionValueInput.readOnly = true;
            if (elementModInput) {
                elementModInput.value = Array.isArray(firstMotion.elem) ? firstMotion.elem.join(', ') : firstMotion.elem;
                elementModInput.readOnly = true;
            }
        } else {
            motionSelect.value = 'custom';
            motionValueInput.readOnly = false;
            if (elementModInput) elementModInput.readOnly = false;
        }
    }



    function updateGunnerUI() {
        const weaponType = weaponTypeSelect.value;
        const gunnerWeapons = ['lbg', 'hbg', 'bow'];
        const isGunner = gunnerWeapons.includes(weaponType);
        if (sharpnessContainer) {
            sharpnessContainer.style.display = isGunner ? 'none' : 'block';
        }

        // 参照ステータス枠の背景画像を更新
        const statusBox = document.getElementById('status-section-box');
        if (statusBox) {
            const imgPath = `icon/weapons/${weaponType}.webp`;
            statusBox.style.backgroundImage = `linear-gradient(rgba(10, 11, 13, 0.7), rgba(10, 11, 13, 0.7)), url('${imgPath}')`;
            statusBox.style.backgroundSize = 'contain';
            statusBox.style.backgroundRepeat = 'no-repeat';
            statusBox.style.backgroundPosition = 'center';
        }
    }

    function getElementBaseValue() {
        const typeId = weaponTypeSelect.value;
        const weapon = WEAPONS.find(w => w.type === typeId);
        const elementType = elementTypeSelect.value;

        if (elementType !== 'none' && weapon) {
            return weapon.element || 0;
        }
        return 0;
    }

    function updateHitzoneDisplay(hitzone) {
        if (!hitzone) return;
        const currentElem = elementTypeSelect.value;
        const hl = (type) => currentElem === type
            ? 'color: #ffcc00; font-weight: bold; background: rgba(255, 215, 0, 0.2); border-radius: 4px; padding: 2px 4px; text-shadow: 0 0 5px rgba(255,204,0,0.5);'
            : 'color: var(--color-secondary); padding: 2px 4px;';

        hitzoneDetailPanel.innerHTML = `
            <div style="grid-column: span 4; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; margin-bottom: 5px;">
                <div style="color: var(--color-primary); display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/hit_slash.png" alt="切断" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.sever}</div>
                <div style="color: var(--color-primary); display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/hit_strike.png" alt="打撃" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.blunt}</div>
                <div style="color: var(--color-primary); display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/hit_shell.png" alt="弾" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.ammo}</div>
                <div></div>
            </div>
            <div style="grid-column: span 4; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.2rem; text-align: center;">
                <div style="${hl('fire')} display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/element_fire.png" alt="火" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.fire}</div>
                <div style="${hl('water')} display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/element_water.png" alt="水" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.water}</div>
                <div style="${hl('thunder')} display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/element_thunder.png" alt="雷" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.thunder}</div>
                <div style="${hl('ice')} display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/element_ice.png" alt="氷" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.ice}</div>
                <div style="${hl('dragon')} display: flex; align-items: center; justify-content: center; gap: 4px;"><img src="icon/element_dragon.png" alt="龍" style="width: 16px; height: 16px; object-fit: contain;"> ${hitzone.dragon}</div>
            </div>
        `;
    }

    function updateHitzoneOptions() {
        const monsterName = monsterSelect.value;
        const monster = MONSTERS[monsterName];

        // ターゲット枠の背景画像を更新
        const targetBox = document.getElementById('target-section-box');
        if (targetBox) {
            const MONSTER_IMAGE_MAP = {
                'ゴグマジオス': 'icon/monsters/gogmazios.webp',
                'オメガ': 'icon/monsters/omega.webp',
                'ラギアクルス': 'icon/monsters/lagiacrus.webp',
                'セルレギオス': 'icon/monsters/seregios.webp',
                'タマミツネ': 'icon/monsters/mizutsune.webp',
                'アルシュベルド': 'icon/monsters/arkveld.webp',
                'ゴアマガラ': 'icon/monsters/gore_magala.webp',
                'グラビモス': 'icon/monsters/gravios.webp',
                'リオレウス': 'icon/monsters/rathalos.webp',
                'ゾシア': 'icon/monsters/zoshia.webp',
                'ジンダハド': 'icon/monsters/jindahaad.webp',
                'レダウ': 'icon/monsters/redau.webp',
                'ウズトゥナ': 'icon/monsters/uzutuna.webp',
                'ネコ式訓練タルパンチャー': 'icon/monsters/dummy.png'
            };
            const imgPath = MONSTER_IMAGE_MAP[monsterName];
            if (imgPath) {
                targetBox.style.backgroundImage = `linear-gradient(rgba(10, 11, 13, 0.7), rgba(10, 11, 13, 0.7)), url('${imgPath}')`;
                targetBox.style.backgroundSize = 'contain';
                targetBox.style.backgroundRepeat = 'no-repeat';
                targetBox.style.backgroundPosition = 'center';
            } else {
                targetBox.style.backgroundImage = 'none';
                targetBox.style.backgroundColor = 'rgba(255, 215, 0, 0.08)';
            }
        }

        hitzoneSelect.innerHTML = '';

        if (monster && monster.parts) {
            monster.parts.forEach((part, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = part.name;
                hitzoneSelect.appendChild(opt);
            });
        }
    }

    function performCalculation() {
        calc.reset();

        // 1. Weapon
        const typeId = weaponTypeSelect.value;
        const typeData = WEAPON_TYPES.find(t => t.id === typeId);
        const weapon = WEAPONS.find(w => w.type === typeId);
        if (weapon && typeData) calc.setWeapon(weapon, typeData);

        // 2. Excitation
        const exciType = excitationSelect.value;
        const weaponSpecificExci = EXCITATION_DATA[typeId];
        if (weaponSpecificExci && weaponSpecificExci[exciType]) {
            calc.setExcitation(weaponSpecificExci[exciType]);
        } else {
            calc.setExcitation({ attack: 0, affinity: 0 });
        }

        // 3. Parts
        const selectedParts = Array.from(partSelects).map(s =>
            RESTORATION_PARTS.find(p => p.id === s.value)
        ).filter(Boolean);
        calc.setRestorationParts(selectedParts);

        const selectedBonusIds = Array.from(bonusSelects).map(s => s.value).filter(id => id !== 'none');
        // Warning display (already partially handled by systematic restriction, but kept for legacy/safety)
        const counts = {};
        let violation = false;
        selectedBonusIds.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
            if (counts[id] > 2) violation = true;
        });
        bonusWarning.style.display = violation ? 'block' : 'none';

        const bonuses = selectedBonusIds.map(id => RESTORATION_BONUSES.find(b => b.id === id));
        calc.setRestorationBonuses(bonuses);

        // 4. Buffs
        const selectedBuffs = [];
        BUFF_GROUPS.forEach(group => {
            if (group.multi) {
                const checkboxes = buffContainer.querySelectorAll(`input[data-group-id="${group.id}"]:checked`);
                checkboxes.forEach(chk => {
                    const buff = group.buffs.find(b => b.id === chk.value);
                    if (buff) selectedBuffs.push(buff);
                });
            } else {
                const select = cachedBuffSelects[group.id];
                if (select && select.value !== 'none') {
                    const buff = group.buffs.find(b => b.id === select.value);
                    if (buff) selectedBuffs.push(buff);
                }
            }
        });
        calc.setBuffs(selectedBuffs);

        // 5. Element
        const baseElementVal = getElementBaseValue();
        calc.setElement(elementTypeSelect.value, baseElementVal);

        // 6. Monster Hitzone
        const monsterName = monsterSelect.value;
        const partIndex = hitzoneSelect.value;
        if (monsterName && partIndex !== "") {
            const hitzone = MONSTERS[monsterName].parts[partIndex];
            calc.setHitzone(hitzone);
            updateHitzoneDisplay(hitzone);
        }

        // 7. Skills
        if (activeSkillsList) activeSkillsList.innerHTML = '';
        let activeCount = 0;

        SKILLS.forEach(skill => {
            const select = cachedSkillSelects[skill.id];
            if (select) {
                const lvl = parseInt(select.value, 10);
                calc.setSkillLevel(skill.id, lvl);

                if (lvl > 0 && activeSkillsList) {
                    activeCount++;
                    const badge = document.createElement('span');
                    badge.style.cssText = 'background: rgba(212, 175, 55, 0.2); color: #fff; padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.3); display: inline-block; word-break: keep-all; font-weight: 500;';
                    badge.textContent = `${skill.name} Lv${lvl}`;
                    activeSkillsList.appendChild(badge);
                }
            }
        });

        if (activeSkillsCount) {
            activeSkillsCount.textContent = `${activeCount}個`;
            if (activeCount === 0 && activeSkillsList) {
                activeSkillsList.innerHTML = '<span style="color:var(--color-text-muted); font-style: italic;">スキルは設定されていません</span>';
            }
        }

        // 8. Motion Value
        calc.setMotionValue(motionValueInput.value || "100");

        // 9. Sharpness
        calc.sharpness = sharpnessSelect.value;

        let currentElemMod = 1.0;

        // Ensure we parse the string input for element mod too
        const parseInputArray = (str) => {
            const parts = str.replace(/[^\d.+,]/g, '').split(/[+,]/);
            const vals = parts.map(p => parseFloat(p)).filter(n => !isNaN(n));
            return vals.length > 0 ? vals : [1.0];
        };

        if (motionSelect && motionSelect.value !== 'custom') {
            const weaponId = weaponTypeSelect.value;
            const index = motionSelect.value;
            const motion = MOTION_VALUES[weaponId][index];
            if (motion) {
                calc.setMotion(motionValueInput.value || "100", motion.elem, motion.partMod, motion.name);
            }
        } else {
            let elemModVal = elementModInput ? elementModInput.value : "1.0";
            calc.setMotion(motionValueInput.value || "100", parseInputArray(elemModVal), 1.0, 'Custom');
        }

        const results = calc.calculateStats(SKILLS);

        // 10. Update UI
        attackDisplay.textContent = results.displayAttack;
        affinityDisplay.textContent = results.affinity + '%';
        displayElement.textContent = results.displayElement;

        displayPhysDamageNormal.textContent = results.physicalDamageNormal;
        displayElemDamageNormal.textContent = results.elementalDamageNormal;
        displayTotalDamageNormal.textContent = results.totalDamageNormal;

        displayPhysDamageCrit.textContent = results.physicalDamageCrit;
        displayElemDamageCrit.textContent = results.elementalDamageCrit;
        displayTotalDamageCrit.textContent = results.totalDamageCrit;

        displayExpectedDamage.textContent = results.expectedDamage;

        // Base stats representation display (Reflects weapon + excitation + restoration parts)
        baseAtkDisplay.textContent = results.baseAttack;
        baseElemDisplay.textContent = results.baseElement;
        baseAffDisplay.textContent = results.baseAffinity + '%';
    }

    // --- Optimal Calculation System ---
    const btnCalculateOptimal = document.getElementById('btn-calculate-optimal');
    const optCalculating = document.getElementById('opt-calculating');
    const optimalResultPanel = document.getElementById('optimal-result-panel');
    const optExpectedDamage = document.getElementById('opt-expected-damage');
    const optExcitation = document.getElementById('opt-excitation');
    const optParts = document.getElementById('opt-parts');
    const optBonuses = document.getElementById('opt-bonuses');
    const btnApplyOptimal = document.getElementById('btn-apply-optimal');
    let currentOptimalConfig = null;

    if (btnCalculateOptimal) {
        btnCalculateOptimal.addEventListener('click', () => {
            optCalculating.style.display = 'block';
            optimalResultPanel.style.display = 'none';

            // Use a slight timeout to allow UI to update (show loading)
            setTimeout(() => {
                const state = getCurrentState();
                const result = runOptimizer(state);

                if (result) {
                    currentOptimalConfig = result;
                    optExpectedDamage.textContent = result.expectedDamageString;

                    const exciData = EXCITATION_TYPES.find(e => e.id === result.excitation);
                    optExcitation.textContent = exciData ? exciData.name : result.excitation;

                    const partNames = result.parts.map(pid => {
                        const p = RESTORATION_PARTS.find(x => x.id === pid);
                        return `<div>・${p ? p.name : pid}</div>`;
                    }).join('');
                    optParts.innerHTML = partNames || '<div>・なし</div>';

                    const bonusNames = result.bonuses.map(bid => {
                        const b = RESTORATION_BONUSES.find(x => x.id === bid);
                        return `<div>・${b ? b.name : bid}</div>`;
                    }).join('');
                    optBonuses.innerHTML = bonusNames || '<div>・なし</div>';

                    optimalResultPanel.style.display = 'block';
                } else {
                    alert('条件を満たす組み合わせが見つかりませんでした。固定項目が多すぎるか、重複制限（同じボーナスは2つまで）に抵触している可能性があります。');
                }
                optCalculating.style.display = 'none';
            }, 10);
        });
    }

    const btnShareBuild = document.getElementById('btn-share-build');
    if (btnShareBuild) {
        btnShareBuild.addEventListener('click', () => {
            const state = getCurrentState();
            const shareUrl = BuildShare.generateUrl(state);
            if (shareUrl) {
                // クリップボードにコピー
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('ビルド共有用URLをクリップボードにコピーしました！\nこのURLを開くと現在の構成を再現できます。');
                }).catch(err => {
                    console.error('Failed to copy', err);
                    prompt('以下のURLをコピーして共有してください:', shareUrl);
                });
            }
        });
    }

    function findOptimalArtiaConfiguration() {
        return runOptimizer(getCurrentState());
    }

    function getCurrentState() {
        const currentSkillLevels = {};
        SKILLS.forEach(skill => {
            const select = cachedSkillSelects[skill.id];
            if (select) currentSkillLevels[skill.id] = parseInt(select.value, 10);
        });

        let targetElemMod = [1.0];
        let motionName = 'Custom';
        if (motionSelect && motionSelect.value !== 'custom') {
            const index = motionSelect.value;
            const motion = MOTION_VALUES[weaponTypeSelect.value] && MOTION_VALUES[weaponTypeSelect.value][index];
            if (motion) {
                targetElemMod = motion.elem;
                motionName = motion.name;
            }
        } else {
            const elemModVal = elementModInput ? elementModInput.value : "1.0";
            const parts = elemModVal.replace(/[^\d.+,]/g, '').split(/[+,]/);
            targetElemMod = parts.map(p => parseFloat(p)).filter(n => !isNaN(n));
            if (targetElemMod.length === 0) targetElemMod = [1.0];
        }

        const locks = {
            excitation: document.getElementById('lock-exci')?.checked || false,
            parts: [],
            bonuses: []
        };
        for (let i = 1; i <= 3; i++) {
            const lock = document.getElementById(`lock-part-${i}`);
            const select = document.getElementById(`part-${i}`);
            if (lock?.checked && select?.value !== 'none') locks.parts.push(select.value);
        }
        for (let i = 1; i <= 5; i++) {
            const lock = document.getElementById(`lock-bonus-${i}`);
            const select = document.getElementById(`bonus-${i}`);
            if (lock?.checked && select?.value !== 'none') locks.bonuses.push(select.value);
        }

        const buffStates = {};
        BUFF_GROUPS.forEach(group => {
            if (group.multi) {
                const checked = Array.from(buffContainer.querySelectorAll(`input[data-group-id="${group.id}"]:checked`)).map(c => c.value);
                buffStates[group.id] = checked;
            } else {
                buffStates[group.id] = cachedBuffSelects[group.id]?.value || 'none';
            }
        });

        return {
            weaponTypeId: weaponTypeSelect.value,
            excitationType: excitationSelect.value,
            elementType: elementTypeSelect.value,
            baseElementVal: getElementBaseValue(),
            monsterName: monsterSelect.value,
            hitzonePartIndex: hitzoneSelect.value,
            currentSkillLevels,
            motionValue: motionValueInput.value || "100",
            motionElementMod: targetElemMod,
            motionName: motionName,
            sharpness: sharpnessSelect.value,
            locks,
            buffStates,
            // 永続化用の追加情報
            motionAction: motionSelect ? motionSelect.value : 'custom',
            elementModValue: elementModInput ? elementModInput.value : "1.0",
            parts: Array.from(partSelects).map(s => s.value),
            bonuses: Array.from(bonusSelects).map(s => s.value)
        };
    }

    function loadStateIntoUI(state) {
        if (!state) return;

        // 1. スキルの表示を一旦すべてリセット (0: ---)
        SKILLS.forEach(skill => {
            const select = cachedSkillSelects[skill.id];
            if (select) select.value = "0";
        });

        // 2. 基本設定の復元
        if (state.weaponTypeId) {
            weaponTypeSelect.value = state.weaponTypeId;
            updateMotionOptions();
        }
        if (state.excitationType) excitationSelect.value = state.excitationType;
        if (state.elementType) elementTypeSelect.value = state.elementType;
        if (state.motionAction !== undefined && motionSelect) motionSelect.value = state.motionAction;
        if (state.motionValue) motionValueInput.value = state.motionValue;
        if (state.elementModValue !== undefined && elementModInput) elementModInput.value = state.elementModValue;
        if (state.sharpness) sharpnessSelect.value = state.sharpness;

        if (state.monsterName) {
            monsterSelect.value = state.monsterName;
            updateHitzoneOptions();
        }
        if (state.hitzonePartIndex !== undefined) {
            hitzoneSelect.value = state.hitzonePartIndex;
        } else if (state.hitzonePart !== undefined) {
            hitzoneSelect.value = state.hitzonePart; // 旧形式対応
        }

        if (state.parts) partSelects.forEach((s, i) => { if (state.parts[i]) s.value = state.parts[i]; });
        if (state.bonuses) bonusSelects.forEach((s, i) => { if (state.bonuses[i]) s.value = state.bonuses[i]; });

        // バフ状態の復元
        if (state.buffStates) {
            // チェックボックスを一旦すべてリセット
            if (buffContainer) {
                const checkboxes = buffContainer.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(c => c.checked = false);
            }

            Object.entries(state.buffStates).forEach(([groupId, val]) => {
                const group = BUFF_GROUPS.find(g => g.id === groupId);
                if (group?.multi && Array.isArray(val)) {
                    val.forEach(bid => {
                        const chk = document.getElementById(`buff-${bid}`);
                        if (chk) chk.checked = true;
                    });
                } else {
                    const select = cachedBuffSelects[groupId];
                    if (select) select.value = val;
                }
            });
        }

        // 3. スキルの復元（新形式と旧形式の両方に対応）
        const skillData = state.currentSkillLevels || state.skills;
        if (skillData) {
            Object.entries(skillData).forEach(([id, lv]) => {
                const select = cachedSkillSelects[id];
                if (select) select.value = lv;
            });
        }

        updateCalculation();
        updateGunnerUI();
    }

    if (btnApplyOptimal) {
        btnApplyOptimal.addEventListener('click', () => {
            if (!currentOptimalConfig) return;
            excitationSelect.value = currentOptimalConfig.excitation;

            partSelects.forEach((s, i) => {
                if (currentOptimalConfig.parts[i]) s.value = currentOptimalConfig.parts[i];
            });

            bonusSelects.forEach((s, i) => {
                if (currentOptimalConfig.bonuses[i]) s.value = currentOptimalConfig.bonuses[i];
                else s.value = 'none';
            });

            updateCalculation();
            alert('最適解を適用しました。');
        });
    }

    function findOptimalArtiaConfiguration() {
        return runOptimizer(getCurrentState());
    }

    // --- My Set System ---
    const mySetList = document.getElementById('myset-list');
    const btnLoadMySet = document.getElementById('btn-load-myset');
    const btnSaveMySet = document.getElementById('btn-save-myset');
    const btnDeleteMySet = document.getElementById('btn-delete-myset');
    const MYSET_STORAGE_KEY = 'mhwilds_mysets';

    function getMySets() {
        try {
            const stored = localStorage.getItem(MYSET_STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch { return {}; }
    }

    function saveMySets(sets) { localStorage.setItem(MYSET_STORAGE_KEY, JSON.stringify(sets)); }

    function updateMySetList() {
        const sets = getMySets();
        mySetList.innerHTML = '<option value="">マイセット選択...</option>';
        for (const name of Object.keys(sets)) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            mySetList.appendChild(opt);
        }
        if (currentLoadedMySetName) {
            mySetList.value = currentLoadedMySetName;
            currentMySetDisplay.textContent = currentLoadedMySetName;
        } else {
            currentMySetDisplay.textContent = '(未保存)';
        }
    }

    function saveCurrentState(setName) {
        if (!setName) return;

        // 最新の共通ロジックを使用して状態を取得
        const setObj = getCurrentState();

        const sets = getMySets();
        sets[setName] = setObj;
        saveMySets(sets);

        currentLoadedMySetName = setName;
        updateMySetList();
        alert(`マイセット「${setName}」を保存しました。`);
    }

    btnSaveMySet.addEventListener('click', () => {
        const setName = prompt('マイセットの名前を入力してください:', currentLoadedMySetName || '');
        if (!setName) return;
        saveCurrentState(setName);
    });

    btnOverwriteMySet.addEventListener('click', () => {
        if (!currentLoadedMySetName) {
            alert('上書きするマイセットが読み込まれていません。「保存」から新規作成してください。');
            return;
        }
        if (confirm(`マイセット「${currentLoadedMySetName}」を現在の設定で上書きしますか？`)) {
            saveCurrentState(currentLoadedMySetName);
        }
    });

    btnLoadMySet.addEventListener('click', () => {
        const setName = mySetList.value;
        if (!setName) { alert('読み込むマイセットを選択してください。'); return; }
        const sets = getMySets();
        const setObj = sets[setName];
        if (!setObj) return;

        currentLoadedMySetName = setName;
        loadStateIntoUI(setObj);
        updateMySetList();
    });

    btnDeleteMySet.addEventListener('click', () => {
        const setName = mySetList.value;
        if (!setName) { alert('削除するマイセットを選択してください。'); return; }
        if (confirm(`マイセット「${setName}」を削除してもよろしいですか？`)) {
            const sets = getMySets();
            delete sets[setName];
            saveMySets(sets);
            if (currentLoadedMySetName === setName) {
                currentLoadedMySetName = null;
            }
            updateMySetList();
        }
    });

    // Keep the init call safe by injecting at the very end
    const _originalInit = init;
    init = function () {
        _originalInit();
        updateMySetList();

        // Check for shared build in URL
        const sharedBuild = BuildShare.decodeUrl();
        if (sharedBuild) {
            setTimeout(() => {
                loadStateIntoUI(sharedBuild);
                alert('共有URLからビルドを読み込みました。');
            }, 100);
        }
    };

    init();
});
