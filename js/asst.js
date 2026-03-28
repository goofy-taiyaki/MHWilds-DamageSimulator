import { ARMOR } from './data/armor.js';
import { DECORATIONS } from './data/decorations.js';
import { SKILLS } from './data/skills.js';
import { TALISMAN_GROUPS, TALISMAN_COMBINATIONS, TALISMAN_SLOTS } from './data/talisman.js';
import { initOCR } from './modules/ocr.js';
import { buildSkillMatrix, sortActivatedSkills } from './result_renderer.js';

const SKILL_NAME_TO_ID = Object.fromEntries(SKILLS.map(s => [s.name, s.id]));
const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s, idx) => [s.id, { ...s, originalIndex: idx }]));
const SKILL_BY_NAME = Object.fromEntries(SKILLS.map((s, idx) => [s.name, { ...s, originalIndex: idx }]));

const PREFERRED_ORDER = [
    "攻撃", "超会心", "見切り", "挑戦者", "弱点特効", "力の解放", "連撃", "逆襲", "巧撃", "鎖刃刺撃", 
    "早食い", "納刀術", "広域化", "無我の境地", "風圧耐性", "龍耐性", "達人芸", "属性変換"
];

document.addEventListener('DOMContentLoaded', () => {
    let weaponDecos = [null, null, null];
    let activeResFilters = new Map(); // idx -> value

    const updateResFilterUI = () => {
        const container = document.getElementById('active-res-filters');
        if (!container) return;
        container.innerHTML = '';
        activeResFilters.forEach((val, idx) => {
            const row = document.createElement('div');
            row.className = 'res-filter-row';
            const names = ['火耐性', '水耐性', '雷耐性', '氷耐性', '龍耐性'];
            row.innerHTML = `
                <span>${names[idx]}</span>
                <input type="number" value="${val}" data-idx="${idx}">
                <span class="res-filter-remove" data-idx="${idx}">×</span>
            `;
            row.querySelector('input').addEventListener('change', (e) => {
                activeResFilters.set(idx, parseInt(e.target.value) || 0);
            });
            row.querySelector('.res-filter-remove').addEventListener('click', () => {
                activeResFilters.delete(idx);
                updateResFilterUI();
            });
            container.appendChild(row);
        });
    };

    const addResFilterEl = document.getElementById('add-res-filter');
    if (addResFilterEl) {
        addResFilterEl.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (!isNaN(idx)) {
                if (!activeResFilters.has(idx)) {
                    activeResFilters.set(idx, 0);
                    updateResFilterUI();
                }
            }
            e.target.value = "";
        });
    }

    // 装飾品ピッカーロジック
    let currentPickingSlot = -1;
    const modal = document.getElementById('deco-picker-modal');
    const overlay = document.getElementById('deco-picker-overlay');
    const searchInput = document.getElementById('deco-picker-search');
    const decoList = document.getElementById('deco-picker-list');

    const openPicker = (slotIdx) => {
        const slotSize = parseInt(document.getElementById(`wslot-${slotIdx}`).value);
        if (slotSize === 0) return; // スロットなし

        currentPickingSlot = slotIdx;
        modal.style.display = 'flex';
        overlay.style.display = 'block';
        searchInput.value = '';
        renderPickerList('', slotSize);
        
        // ヘッダーのテキストを更新して現在のスロットサイズを表示
        document.querySelector('#deco-picker-header div').textContent = `装飾品を選択 (スロット[${slotSize}]以下)`;
    };

    const closePicker = () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };

    const renderPickerList = (query, limitLvl) => {
        if (limitLvl === undefined) {
             limitLvl = parseInt(document.getElementById(`wslot-${currentPickingSlot}`).value);
        }
        decoList.innerHTML = '<div class="deco-pick-item none" data-did="">自動選択 (クリア)</div>';
        const filtered = DECORATIONS.filter(d => {
            if (d.t !== 'w') return false;
            if (d.sl > limitLvl) return false;
            const matchQuery = (d.n.includes(query) || (d.sk && d.sk.some(s => s.n.includes(query))));
            return !query || matchQuery;
        });
        filtered.forEach(d => {
            const el = document.createElement('div');
            el.className = 'deco-pick-item';
            el.textContent = `${d.n} [${d.sl}]`;
            el.dataset.did = d.sk && d.sk[0] ? d.sk[0].n : d.n;
            el.addEventListener('click', () => {
                weaponDecos[currentPickingSlot - 1] = d;
                document.getElementById(`wdeco-${currentPickingSlot}`).textContent = d.n;
                closePicker();
            });
            decoList.appendChild(el);
        });
        const noneBtn = decoList.querySelector('.none');
        if (noneBtn) {
            noneBtn.addEventListener('click', () => {
                weaponDecos[currentPickingSlot - 1] = null;
                document.getElementById(`wdeco-${currentPickingSlot}`).textContent = '自動選択';
                closePicker();
            });
        }
    };

    [1, 2, 3].forEach(i => {
        const el = document.getElementById(`wdeco-${i}`);
        if (el) el.addEventListener('click', () => openPicker(i));
    });

    document.getElementById('deco-picker-close')?.addEventListener('click', closePicker);
    overlay?.addEventListener('click', closePicker);
    searchInput?.addEventListener('input', (e) => renderPickerList(e.target.value));

    // スロットサイズ変更時に、サイズオーバーした装飾品をクリアする
    document.querySelectorAll('.wslot-size-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const idx = parseInt(e.target.id.replace('wslot-', ''));
            const newSize = parseInt(e.target.value);
            const currentDeco = weaponDecos[idx - 1];
            if (currentDeco && currentDeco.sl > newSize) {
                weaponDecos[idx - 1] = null;
                document.getElementById(`wdeco-${idx}`).textContent = '自動選択';
            } else if (newSize === 0) {
                weaponDecos[idx - 1] = null;
                document.getElementById(`wdeco-${idx}`).textContent = 'なし';
            } else if (document.getElementById(`wdeco-${idx}`).textContent === 'なし') {
                document.getElementById(`wdeco-${idx}`).textContent = '自動選択';
            }
        });
    });

    const weaponSsSelect = document.getElementById('weapon-ss');
    const weaponGsSelect = document.getElementById('weapon-gs');

    const searchParams = new URLSearchParams(window.location.search);
    const targetSkills = {};

    searchParams.forEach((value, key) => {
        const lvl = parseInt(value, 10);
        if (isNaN(lvl) || lvl <= 0) return;
        const skill = SKILL_BY_ID[key];
        if (skill) targetSkills[key] = lvl;
    });

    if (Object.keys(targetSkills).length === 0) {
        const fallback = localStorage.getItem('asst_request');
        if (fallback) {
            try {
                const data = JSON.parse(fallback);
                if (data.skills && (Date.now() - data.timestamp < 15000)) {
                    Object.assign(targetSkills, data.skills);
                }
            } catch (e) { }
        }
    }

    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const resultCountEl = document.getElementById('result-count');
    const resultsContainer = document.getElementById('results-container');
    const emptyMessage = document.getElementById('empty-message');
    const btnReSearch = document.getElementById('btn-re-search');
    const skillsSelectionList = document.getElementById('skills-selection-list');
    const skillSearchInput = document.getElementById('skill-search-input');
    const activeSkillsList = document.getElementById('active-skills-list');
    const btnClearSkills = document.getElementById('btn-clear-skills');
    const cachedSkillSelects = {};

    const updateWeaponSkillSelects = () => {
        if (weaponSsSelect) {
            const currentVal = weaponSsSelect.value;
            weaponSsSelect.innerHTML = '<option value="">武器固有：自動選択</option>';
            SKILLS.filter(s => s.mainCategory === 'series').forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = (targetSkills[s.id] ? '★ ' : '') + s.name;
                weaponSsSelect.appendChild(opt);
            });
            weaponSsSelect.value = currentVal;
        }
        if (weaponGsSelect) {
            const currentVal = weaponGsSelect.value;
            weaponGsSelect.innerHTML = '<option value="">武器固有：自動選択</option>';
            SKILLS.filter(s => s.mainCategory === 'group').forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = (targetSkills[s.id] ? '★ ' : '') + s.name;
                weaponGsSelect.appendChild(opt);
            });
            weaponGsSelect.value = currentVal;
        }
    };

    //初期表示のスキル構成バッジ更新関数
    const updateTargetSummary = () => {
        const targetSummaryEl = document.getElementById('target-summary');
        if (!targetSummaryEl) return;
        targetSummaryEl.innerHTML = '';
        
        // 仕様に基づくソート: メインカテゴリ > レベル > 内部順序
        const sortedIds = Object.keys(targetSkills).sort((a, b) => {
            const sA = SKILL_BY_ID[a], sB = SKILL_BY_ID[b];
            const lA = targetSkills[a], lB = targetSkills[b];
            
            const catPoints = { 'weapon': 1, 'armor': 2, 'series': 3, 'group': 4 };
            const pA = catPoints[sA.mainCategory] || 2;
            const pB = catPoints[sB.mainCategory] || 2;
            if (pA !== pB) return pA - pB;
            
            if (lA !== lB) return lB - lA;
            return (sA.originalIndex || 0) - (sB.originalIndex || 0);
        });

        sortedIds.forEach(sid => {
            const s = SKILL_BY_ID[sid];
            if (!s) return;
            const badge = document.createElement('span');
            badge.className = 'target-skill-badge';
            
            let label = "";
            if (s.mainCategory === 'series' || s.mainCategory === 'group') {
                const prefix = s.mainCategory === 'series' ? '[S]' : '[G]';
                const seriesName = s.name.replace(/[ⅠⅡⅢⅣⅤ]$/, '').trim();
                const lvl = targetSkills[sid];
                const effect = (s.effects && s.effects[lvl - 1]) ? s.effects[lvl - 1] : null;
                const effectName = effect && effect.name ? ` (${effect.name})` : '';
                label = `${prefix} ${seriesName}${effectName}`;
            } else {
                label = `${s.name} Lv${targetSkills[sid]}`;
            }
            badge.textContent = label;
            targetSummaryEl.appendChild(badge);
        });

        // 武器設定の☆マークも更新
        updateWeaponSkillSelects();
    };

    // 初期化実行
    updateTargetSummary();

    // スキル設定UIの初期化
    const initSkillSelectionUI = () => {
        if (!skillsSelectionList) return;
        skillsSelectionList.innerHTML = '';

        const MAIN_CATEGORY_NAMES = { weapon: '武器スキル', armor: '防具スキル', series: 'シリーズスキル', group: 'グループスキル' };
        const MAIN_CATEGORY_ORDER = ['weapon', 'armor', 'series', 'group'];

        MAIN_CATEGORY_ORDER.forEach(mainCat => {
            const catSkills = SKILLS.filter(s => s.mainCategory === mainCat);
            if (catSkills.length === 0) return;

            const mainHeader = document.createElement('div');
            mainHeader.className = 'skill-category-title';
            mainHeader.textContent = MAIN_CATEGORY_NAMES[mainCat];
            skillsSelectionList.appendChild(mainHeader);

            const SUB_CATEGORY_NAMES = { attack: '攻撃力強化', affinity: '会心率', element: '属性・状態異常', ammo: '弾・矢強化', utility: 'その他' };
            const SUB_CATEGORY_ORDER = ['attack', 'affinity', 'element', 'ammo', 'utility', null];

            SUB_CATEGORY_ORDER.forEach(subCat => {
                const subSkills = catSkills.filter(s => s.subCategory === subCat);
                if (subSkills.length === 0) return;

                if (subCat !== null) {
                    const subHeader = document.createElement('div');
                    subHeader.className = 'skill-subcategory-title';
                    subHeader.textContent = SUB_CATEGORY_NAMES[subCat] || '';
                    skillsSelectionList.appendChild(subHeader);
                }

                subSkills.forEach(skill => {
                    const row = document.createElement('div');
                    row.className = 'skill-selector-row';
                    if (targetSkills[skill.id]) row.classList.add('selected');

                    let displayName = skill.name;
                    
                    // 検索用キーワード
                    const searchKeys = [skill.name.toLowerCase()];
                    const firstEffect = (skill.effects && skill.effects[0]) ? skill.effects[0] : null;
                    if (firstEffect && firstEffect.name) searchKeys.push(firstEffect.name.toLowerCase());
                    if (skill.effects) {
                        skill.effects.forEach(e => { if (e.name) searchKeys.push(e.name.toLowerCase()); });
                    }
                    
                    if (skill.mainCategory === 'series' || skill.mainCategory === 'group') {
                        const prefix = skill.mainCategory === 'series' ? '[S]' : '[G]';
                        displayName = `${prefix} ${displayName.replace(/[ⅠⅡⅢⅣⅤ]$/, '').trim()}`;
                    }
                    
                    row.dataset.search = searchKeys.join('|');

                    row.innerHTML = `
                        <div class="skill-name" title="${skill.name}">${displayName}</div>
                        <select id="skill-${skill.id}" data-skill-id="${skill.id}">
                            ${Array.from({ length: skill.maxLevel + 1 }, (_, i) => {
                                if (i === 0) return `<option value="0">---</option>`;
                                const effect = (skill.effects && skill.effects[i-1]) ? skill.effects[i-1] : null;
                                let label = `Lv.${i}`;
                                if (skill.mainCategory === 'series' || skill.mainCategory === 'group') {
                                    label = effect && effect.name ? effect.name : `${skill.name} Lv.${i}`;
                                } else {
                                    label = `Lv.${i}`;
                                }
                                return `<option value="${i}">${label}</option>`;
                            }).join('')}
                        </select>
                    `;
                    skillsSelectionList.appendChild(row);
                    const selectEl = row.querySelector('select');
                    cachedSkillSelects[skill.id] = selectEl;
                    selectEl.value = targetSkills[skill.id] || 0;

                    selectEl.addEventListener('change', (e) => {
                        const lvl = parseInt(e.target.value);
                        if (lvl > 0) {
                            targetSkills[skill.id] = lvl;
                            row.classList.add('selected');
                        } else {
                            delete targetSkills[skill.id];
                            row.classList.remove('selected');
                        }
                        updateActiveSkillsUI();
                        updateTargetSummary();
                    });
                });
            });
        });
        updateActiveSkillsUI();

        // OCRの初期化
        initOCR(SKILLS, cachedSkillSelects, () => {
            // OCR適用後の後処理: targetSkillsを同期し、UIを更新する
            Object.keys(cachedSkillSelects).forEach(sid => {
                const selectEl = cachedSkillSelects[sid];
                const lvl = parseInt(selectEl.value);
                const row = selectEl.closest('.skill-selector-row');
                if (lvl > 0) {
                    targetSkills[sid] = lvl;
                    if (row) row.classList.add('selected');
                } else {
                    delete targetSkills[sid];
                    if (row) row.classList.remove('selected');
                }
            });
            updateActiveSkillsUI();
            updateTargetSummary();
        });
    };

    const updateActiveSkillsUI = () => {
        if (!activeSkillsList) return;
        activeSkillsList.innerHTML = '';
        
        // 仕様に基づくソート: メインカテゴリ > レベル > 内部順序
        const sortedIds = Object.keys(targetSkills).sort((a, b) => {
            const sA = SKILL_BY_ID[a], sB = SKILL_BY_ID[b];
            const lA = targetSkills[a], lB = targetSkills[b];
            
            const catPoints = { 'weapon': 1, 'armor': 2, 'series': 3, 'group': 4 };
            const pA = catPoints[sA.mainCategory] || 2;
            const pB = catPoints[sB.mainCategory] || 2;
            if (pA !== pB) return pA - pB;
            
            if (lA !== lB) return lB - lA;
            return (sA.originalIndex || 0) - (sB.originalIndex || 0);
        });

        sortedIds.forEach(sid => {
            const skill = SKILL_BY_ID[sid];
            if (!skill) return;
            const badge = document.createElement('div');
            badge.className = 'active-skill-badge';
            
            let label = "";
            if (skill.mainCategory === 'series' || skill.mainCategory === 'group') {
                const prefix = skill.mainCategory === 'series' ? '[S]' : '[G]';
                const seriesName = skill.name.replace(/[ⅠⅡⅢⅣⅤ]$/, '').trim();
                const lvl = targetSkills[sid];
                const effect = (skill.effects && skill.effects[lvl - 1]) ? skill.effects[lvl - 1] : null;
                const effectName = effect && effect.name ? ` (${effect.name})` : '';
                label = `${prefix} ${seriesName}${effectName}`;
            } else {
                label = `${skill.name} Lv${targetSkills[sid]}`;
            }
            
            badge.innerHTML = `<span>${label}</span>`;
            activeSkillsList.appendChild(badge);
        });
    };

    const applySkillFilter = (term) => {
        if (!skillsSelectionList) return;
        const rawQuery = (term || '').toLowerCase().trim();
        
        if (rawQuery === '') {
            const allRows = skillsSelectionList.querySelectorAll('.skill-selector-row');
            const allTitles = skillsSelectionList.querySelectorAll('.skill-category-title, .skill-subcategory-title');
            allRows.forEach(r => r.style.display = 'grid');
            allTitles.forEach(t => t.style.display = 'block');
            return;
        }

        // 検索ワードからレベル表記 (Lv1, 1, Ⅰ等) を除去した「純粋な名前」も生成
        let skillNameQuery = rawQuery;
        const lvMatch = rawQuery.match(/(?:lv|lv\.?|)[ \.]*([1-9]|[ⅠⅡⅢⅣⅤ]|I{1,3}|IV|V)$/i);
        if (lvMatch) {
            skillNameQuery = rawQuery.slice(0, rawQuery.lastIndexOf(lvMatch[0])).trim();
        }
        if (!skillNameQuery && rawQuery) skillNameQuery = rawQuery;

        const rows = skillsSelectionList.querySelectorAll('.skill-selector-row');
        const titles = skillsSelectionList.querySelectorAll('.skill-category-title, .skill-subcategory-title');
        
        titles.forEach(t => t.style.display = 'none');
        rows.forEach(row => {
            const searchData = row.dataset.search || '';
            
            // 判定：入力文字列そのものが含まれるか、あるいはレベルを除去した名前が含まれるか
            const isMatch = searchData.includes(rawQuery) || searchData.includes(skillNameQuery);
            row.style.display = isMatch ? 'grid' : 'none';
        });
    };

    if (skillSearchInput) {
        skillSearchInput.addEventListener('input', (e) => applySkillFilter(e.target.value.toLowerCase().trim()));
        
        // Enterキーでスキルを自動選択
        skillSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.toLowerCase().trim();
                if (!term) return;

                let level = 1;
                let cleanTerm = term;

                // レベル表記 (Lv1, 1, Ⅰ, I) の抽出
                const lvMatch = term.match(/(?:lv|lv\.?|)[ \.]*([1-9]|[ⅠⅡⅢⅣⅤ]|I{1,3}|IV|V)$/i);
                if (lvMatch) {
                    const rawLvl = lvMatch[1];
                    cleanTerm = term.slice(0, term.lastIndexOf(lvMatch[0])).trim();
                    
                    // アラビア数字、Unicodeローマ数字、アルファベットローマ数字を変換
                    if (/[1-9]/.test(rawLvl)) {
                        level = parseInt(rawLvl, 10);
                    } else if (/[ⅠⅡⅢⅣⅤ]/.test(rawLvl)) {
                        const romanMap = { 'ⅰ': 1, 'ⅱ': 2, 'ⅲ': 3, 'ⅳ': 4, 'ⅴ': 5 };
                        level = romanMap[rawLvl.toLowerCase()] || 1;
                    } else {
                        const romanMap = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5 };
                        level = romanMap[rawLvl.toLowerCase()] || 1;
                    }
                }

                // 表示されている候補の中からマッチするものを探す
                const visibleRows = Array.from(skillsSelectionList.querySelectorAll('.skill-selector-row'))
                    .filter(r => r.style.display !== 'none');

                if (visibleRows.length > 0) {
                    // 1. 表示名(発動スキル名)またはシリーズ名との完全一致を最優先
                    let targetRow = visibleRows.find(r => {
                        const name = r.querySelector('.skill-name').textContent.toLowerCase();
                        const orig = r.querySelector('.skill-name').title.toLowerCase();
                        return name === cleanTerm || orig === cleanTerm;
                    });

                    // 2. 完全一致がなければ、最初の表示行（前方一致に近いもの）を選択
                    if (!targetRow) {
                        targetRow = visibleRows[0];
                    }

                    if (targetRow) {
                        const select = targetRow.querySelector('select');
                        const maxLvl = select.options.length - 1;
                        const finalLevel = Math.min(level, maxLvl);
                        
                        // レベルが指定されていない、かつグループスキルの場合は強制的にLv1とする
                        // (selectのvalueを変更してchangeイベントを発火)
                        select.value = finalLevel;
                        select.dispatchEvent(new Event('change'));

                        // 選択後はリセット
                        e.target.value = '';
                        applySkillFilter('');
                    }
                }
            }
        });
    }

    if (btnClearSkills) {
        btnClearSkills.addEventListener('click', () => {
            Object.keys(targetSkills).forEach(sid => {
                delete targetSkills[sid];
                if (cachedSkillSelects[sid]) {
                    cachedSkillSelects[sid].value = 0;
                    cachedSkillSelects[sid].closest('.skill-selector-row').classList.remove('selected');
                }
            });
            updateActiveSkillsUI();
            updateTargetSummary();
        });
    }

    initSkillSelectionUI();

    // Talisman UI Setup
    const tRareSelect = document.getElementById('talisman-rare');
    const tSlotSelect = document.getElementById('talisman-slot-select');
    const tSkillSelects = [
        document.getElementById('talisman-skill-1'),
        document.getElementById('talisman-skill-2'),
        document.getElementById('talisman-skill-3')
    ];
    const talismanAutoCheckbox = document.getElementById('talisman-auto');
    const talismanSelectorUi = document.getElementById('talisman-selector-ui');

    if (talismanAutoCheckbox && talismanSelectorUi) {
        const updateTalismanUI = () => {
            talismanSelectorUi.style.opacity = talismanAutoCheckbox.checked ? '0.5' : '1';
            talismanSelectorUi.style.pointerEvents = talismanAutoCheckbox.checked ? 'none' : 'auto';
        };
        talismanAutoCheckbox.onchange = updateTalismanUI;
        updateTalismanUI();
    }

    function updateTalismanDropdowns(index) {
        if (!tRareSelect || !tSkillSelects[0]) return;
        if (index === -1) {
            const rareVal = tRareSelect.value;
            let possibleGroups = new Set();
            TALISMAN_COMBINATIONS.forEach(p => { if (rareVal === 'any' || p.rare == rareVal) possibleGroups.add(p.s1); });
            populateTalismanSelect(tSkillSelects[0], possibleGroups, '第1スキル');
            tSkillSelects[1].innerHTML = '<option value="any">第2スキル：指定なし</option>';
            tSkillSelects[2].innerHTML = '<option value="any">第3スキル：指定なし</option>';
            updateTalismanDropdowns(0);
            return;
        }
        const rareVal = tRareSelect.value;
        const s1Key = tSkillSelects[0].value;
        const s2Key = tSkillSelects[1].value;
        const excludeNames = [];
        if (s1Key !== 'any') excludeNames.push(s1Key.split('|')[0]);
        if (s2Key !== 'any') excludeNames.push(s2Key.split('|')[0]);

        if (index === 0) {
            let possibleGroups = new Set();
            TALISMAN_COMBINATIONS.forEach(p => {
                if (rareVal === 'any' || p.rare == rareVal) {
                    const s1Match = s1Key === 'any' || (TALISMAN_GROUPS[p.s1] && TALISMAN_GROUPS[p.s1].some(s => `${s.name}|${s.level}` === s1Key));
                    if (s1Match) possibleGroups.add(p.s2);
                }
            });
            populateTalismanSelect(tSkillSelects[1], possibleGroups, '第2スキル', excludeNames);
            updateTalismanDropdowns(1);
        } else if (index === 1) {
            let possibleGroups = new Set();
            TALISMAN_COMBINATIONS.forEach(p => {
                if (rareVal === 'any' || p.rare == rareVal) {
                    const s1Match = s1Key === 'any' || (TALISMAN_GROUPS[p.s1] && TALISMAN_GROUPS[p.s1].some(s => `${s.name}|${s.level}` === s1Key));
                    const s2Match = s2Key === 'any' || (TALISMAN_GROUPS[p.s2] && TALISMAN_GROUPS[p.s2].some(s => `${s.name}|${s.level}` === s2Key));
                    if (s1Match && s2Match && p.s3) possibleGroups.add(p.s3);
                }
            });
            populateTalismanSelect(tSkillSelects[2], possibleGroups, '第3スキル', excludeNames);
            updateTalismanDropdowns(2);
        } else {
            let possibleSlots = new Set();
            const s3Key = tSkillSelects[2].value;
            TALISMAN_COMBINATIONS.forEach(p => {
                if (rareVal === 'any' || p.rare == rareVal) {
                    const s1Match = s1Key === 'any' || (TALISMAN_GROUPS[p.s1] && TALISMAN_GROUPS[p.s1].some(s => `${s.name}|${s.level}` === s1Key));
                    const s2Match = s2Key === 'any' || (TALISMAN_GROUPS[p.s2] && TALISMAN_GROUPS[p.s2].some(s => `${s.name}|${s.level}` === s2Key));
                    const s3Match = s3Key === 'any' || (p.s3 && TALISMAN_GROUPS[p.s3] && TALISMAN_GROUPS[p.s3].some(s => `${s.name}|${s.level}` === s3Key));
                    if (s1Match && s2Match && (s3Key === 'any' || s3Match)) {
                        (TALISMAN_SLOTS[`RARE${p.rare}`] || []).forEach(sl => possibleSlots.add(sl));
                    }
                }
            });
            const currentSlot = tSlotSelect.value;
            tSlotSelect.innerHTML = '<option value="any">スロット指定</option>';
            Array.from(possibleSlots).forEach(slot => {
                const opt = document.createElement('option');
                opt.value = slot;
                opt.textContent = slot;
                if (slot.startsWith('W')) opt.textContent += ' (武器)';
                tSlotSelect.appendChild(opt);
            });
            if (possibleSlots.has(currentSlot)) tSlotSelect.value = currentSlot;
        }
    }

    function populateTalismanSelect(selectEl, groupIds, label, excludeNames = []) {
        const currentVal = selectEl.value;
        selectEl.innerHTML = `<option value="any">${label}：指定なし</option>`;
        Array.from(groupIds).sort((a, b) => a - b).forEach(gid => {
            const skills = (TALISMAN_GROUPS[gid] || []).filter(s => !excludeNames.includes(s.name));
            if (skills.length > 0) {
                const groupHeader = document.createElement('option');
                groupHeader.disabled = true; groupHeader.textContent = `--- Group ${gid} ---`;
                selectEl.appendChild(groupHeader);
                skills.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = `${s.name}|${s.level}`;
                    opt.textContent = `${s.name} Lv${s.level}`;
                    selectEl.appendChild(opt);
                });
            }
        });
        if (Array.from(selectEl.options).some(o => o.value === currentVal)) selectEl.value = currentVal;
    }

    if (tRareSelect) {
        tRareSelect.onchange = () => updateTalismanDropdowns(-1);
        tSkillSelects.forEach((s, i) => { if (s) s.onchange = () => updateTalismanDropdowns(i); });
        updateTalismanDropdowns(-1);

        const btnFav = document.getElementById('btn-talisman-fav');
        const btnFavSkills = document.getElementById('btn-talisman-fav-skills');
        const talismanAutoCheckbox = document.getElementById('talisman-auto');
        const talismanSelectorUI = document.getElementById('talisman-selector-ui');

        const updateTalismanUIVisibility = () => {
            if ((talismanAutoCheckbox && talismanAutoCheckbox.checked) || 
                (btnFavSkills && btnFavSkills.classList.contains('active'))) {
                talismanSelectorUI.style.opacity = '0.5';
                talismanSelectorUI.style.pointerEvents = 'none';
            } else {
                talismanSelectorUI.style.opacity = '1';
                talismanSelectorUI.style.pointerEvents = 'auto';
            }
        };

        if (btnFavSkills) {
            btnFavSkills.onclick = () => {
                const isActive = btnFavSkills.classList.toggle('active');
                if (isActive) {
                    btnFavSkills.style.background = 'rgba(0, 204, 255, 0.2)';
                    btnFavSkills.style.borderColor = '#66ccff';
                    if (btnFav) {
                        btnFav.classList.remove('active');
                        btnFav.style.background = 'rgba(255, 215, 0, 0.05)';
                        btnFav.style.borderColor = 'rgba(255, 215, 0, 0.4)';
                    }
                    if (talismanAutoCheckbox && talismanAutoCheckbox.checked) {
                        talismanAutoCheckbox.checked = false;
                    }
                } else {
                    btnFavSkills.style.background = 'rgba(0, 204, 255, 0.05)';
                    btnFavSkills.style.borderColor = 'rgba(0, 204, 255, 0.4)';
                }
                updateTalismanUIVisibility();
            };
        }

        if (btnFav) {
            btnFav.onclick = () => {
                const isActive = btnFav.classList.toggle('active');
                if (isActive) {
                    btnFav.style.background = 'rgba(255, 215, 0, 0.2)';
                    btnFav.style.borderColor = '#ffcc00';
                    if (btnFavSkills) {
                        btnFavSkills.classList.remove('active');
                        btnFavSkills.style.background = 'rgba(0, 204, 255, 0.05)';
                        btnFavSkills.style.borderColor = 'rgba(0, 204, 255, 0.4)';
                    }
                    if (talismanAutoCheckbox && talismanAutoCheckbox.checked) {
                        talismanAutoCheckbox.checked = false;
                    }
                } else {
                    btnFav.style.background = 'rgba(255, 215, 0, 0.05)';
                    btnFav.style.borderColor = 'rgba(255, 215, 0, 0.4)';
                }
                updateTalismanUIVisibility();
            };
        }

        if (talismanAutoCheckbox) {
            talismanAutoCheckbox.onchange = () => {
                if (talismanAutoCheckbox.checked) {
                    if (btnFav) {
                        btnFav.classList.remove('active');
                        btnFav.style.background = 'rgba(255, 215, 0, 0.05)';
                        btnFav.style.borderColor = 'rgba(255, 215, 0, 0.4)';
                    }
                    if (btnFavSkills) {
                        btnFavSkills.classList.remove('active');
                        btnFavSkills.style.background = 'rgba(0, 204, 255, 0.05)';
                        btnFavSkills.style.borderColor = 'rgba(0, 204, 255, 0.4)';
                    }
                }
                updateTalismanUIVisibility();
            };
        }
    }

    const startSearch = () => {
        if (Object.keys(targetSkills).length === 0) {
            statusText.textContent = 'スキル構成が空です。シミュレーターでスキルを選択してください。';
            return;
        }

        const wSkills = {
            auto_ss: weaponSsSelect.value === "",
            auto_gs: weaponGsSelect.value === ""
        };
        if (!wSkills.auto_ss && weaponSsSelect.value) wSkills[weaponSsSelect.value] = 1;
        if (!wSkills.auto_gs && weaponGsSelect.value) wSkills[weaponGsSelect.value] = 1;

        // 武器装飾品のスキルを加算
        weaponDecos.forEach(d => {
            if (d && d.sk) {
                d.sk.forEach(s => {
                    const sid = SKILL_NAME_TO_ID[s.n];
                    if (sid) wSkills[sid] = (wSkills[sid] || 0) + s.l;
                });
            }
        });

        const wSlotsFull = [];
        [1, 2, 3].forEach(i => {
            const size = parseInt(document.getElementById(`wslot-${i}`).value);
            if (size > 0) wSlotsFull.push(size);
        });

        const wSlotsRemaining = [];
        [1, 2, 3].forEach(i => {
            const size = parseInt(document.getElementById(`wslot-${i}`).value);
            if (size > 0 && !weaponDecos[i-1]) {
                wSlotsRemaining.push(size);
            }
        });

        const isAutoTalisman = talismanAutoCheckbox && talismanAutoCheckbox.checked;
        const isFavSkillsMode = document.getElementById('btn-talisman-fav-skills')?.classList.contains('active');
        const talismanData = {};
        let talismanSlots = [];

        if (!isAutoTalisman && !isFavSkillsMode && !document.getElementById('btn-talisman-fav')?.classList.contains('active')) {
            tSkillSelects.forEach(s => {
                if (s && s.value !== 'any') {
                    const [name, lvl] = s.value.split('|');
                    const skill = SKILL_BY_NAME[name];
                    if (skill) talismanData[skill.id] = parseInt(lvl, 10);
                }
            });
            const tSlotVal = (tSlotSelect && tSlotSelect.value) || 'any';
            if (tSlotVal !== 'any') {
                const isW = tSlotVal.startsWith('W');
                const cleaned = tSlotVal.replace('W', '');
                for (let i = 0; i < cleaned.length; i++) {
                    const char = cleaned[i];
                    let lvl = 0;
                    if (char === '①') lvl = 1;
                    else if (char === '②') lvl = 2;
                    else if (char === '③') lvl = 3;
                    else if (char === '④') lvl = 4;
                    if (lvl > 0) {
                        // 護石がW開始（RARE8）の場合、最初の1個目だけが武器枠(w)。残りは防具枠(a)。
                        talismanSlots.push({ lvl, type: (isW && i === 0) ? 'w' : 'a' });
                    }
                }
            }
        }

        performSearch(targetSkills, wSlotsRemaining, wSkills, talismanData, talismanSlots, isAutoTalisman, [...weaponDecos], wSlotsFull, isFavSkillsMode);
    };

    if (btnReSearch) btnReSearch.onclick = startSearch;

    // 初回検索
    setTimeout(startSearch, 200);

    async function performSearch(target, wSlots, wSkills, tDataFixed, tSlotsFixed, autoTalisman, manualWDecos, fullWSlots, isFavSkillsMode) {
        statusText.innerHTML = '<span class="loader"></span>初期化中...';
        const targetPoints = {};

        for (const id in target) {
            const skill = SKILL_BY_ID[id];
            if (skill) {
                let pts = target[id];
                if (skill.mainCategory === 'series') pts = target[id] * 2;
                else if (skill.mainCategory === 'group') pts = 3; // 修正：3点そろって発動するため3点要求とする
                targetPoints[id] = pts;
            }
        }

        await new Promise(r => setTimeout(r, 50));
        statusText.innerHTML = '<span class="loader"></span>防具データを整理中...';

        const armorLabels = ['頭', '胴', '腕', '腰', '脚', '護石'];
        const armorParts = { head: [], chest: [], arms: [], waist: [], legs: [], talisman: [] };
        ARMOR.forEach(a => {
            if (!armorParts[a.p]) return;
            const rel = {};
            if (a.sk) a.sk.forEach(s => {
                const sid = SKILL_NAME_TO_ID[s.n];
                if (sid && targetPoints[sid]) rel[sid] = (rel[sid] || 0) + s.l;
            });
            if (a.ss) {
                a.ss.split(',').forEach(sname => {
                    const sid = SKILL_NAME_TO_ID[sname.trim()];
                    if (sid && targetPoints[sid]) rel[sid] = Math.max(rel[sid] || 0, 1);
                });
            }
            if (a.gs) {
                a.gs.split(',').forEach(sname => {
                    const sid = SKILL_NAME_TO_ID[sname.trim()];
                    if (sid && targetPoints[sid]) rel[sid] = Math.max(rel[sid] || 0, 1);
                });
            }
            armorParts[a.p].push({
                ...a,
                name: a.n,
                set: a.s,
                slots: a.sl || [0, 0, 0],
                sl: a.sl || [0, 0, 0],
                skills: rel,
                defense: a.d,
                p: a.p
            });
        });

        const prune = (list, targets) => {
            if (list.length === 0) return [];
            const tIds = Object.keys(targets);
            const evaluated = list.map(item => {
                let sScore = 0;
                tIds.forEach(id => sScore += (item.skills[id] || 0));
                const slotScore = (item.slots || []).reduce((sum, s) => sum + (s.lvl || s || 0), 0);
                const slotDetail = (item.slots || []).map(s => s.lvl || s || 0).sort((a, b) => b - a);
                return { item, sScore, slotScore, slotDetail, def: item.defense || 0 };
            });

            const survivors = [];
            evaluated.sort((a, b) => b.sScore - a.sScore || b.slotScore - a.slotScore || b.def - a.def);
            const targetDebugNames = ['クイーンピアスα', 'エグゾルスメイルγ', '護火竜アームβ', '護火竜コイルβ', 'トゥナムルグリーヴγ'];

            for (let i = 0; i < evaluated.length; i++) {
                const a = evaluated[i];
                let isInferior = false;
                for (let j = 0; j < survivors.length; j++) {
                    const b = survivors[j];
                    if (b.sScore >= a.sScore && b.slotScore >= a.slotScore && b.def >= a.def) {
                        const skillsOk = tIds.every(id => (b.item.skills[id] || 0) >= (a.item.skills[id] || 0));
                        const slotsOk = b.slotDetail.every((lvl, idx) => lvl >= (a.slotDetail[idx] || 0));
                        if (skillsOk && slotsOk) { isInferior = true; break; }
                    }
                }
                if (!isInferior) {
                    survivors.push(a);
                } else {
                    if (targetDebugNames.includes(a.item.name)) {
                        console.log(`[DEBUG] Pruned Component: ${a.item.name} is inferior to another item.`);
                    }
                }
            }
            const hasSkill = survivors.filter(s => s.sScore > 0);
            const noSkill = survivors.filter(s => s.sScore === 0);

            targetDebugNames.forEach(name => {
                if (list.find(x => x.name === name) && !survivors.find(x => x.item.name === name)) {
                    console.log(`[DEBUG] ${name} NOT in survivors! sScore=${evaluated.find(e => e.item.name === name)?.sScore}`);
                }
            });

            noSkill.sort((a, b) => b.slotScore - a.slotScore || b.def - a.def);
            return [...hasSkill.map(s => s.item), ...noSkill.slice(0, 15).map(s => s.item)];
        };

        statusText.innerHTML = '<span class="loader"></span>護石パターンを生成中...';
        let relevantTalismans = [];
        const isFavMode = document.getElementById('btn-talisman-fav')?.classList.contains('active');

        if (isFavMode) {
            const favData = JSON.parse(localStorage.getItem('mhwilds_fav_talismans') || '[]');
            favData.forEach(f => {
                const relSkills = {};
                (f.skills || []).forEach(s => {
                    const found = SKILL_BY_NAME[s.name];
                    const sid = found ? found.id : null;
                    if (sid && targetPoints[sid]) relSkills[sid] = (relSkills[sid] || 0) + parseInt(s.level, 10);
                });

                let tSlots = [];
                if (f.slot && f.slot !== '-') {
                    const isW = f.slot.startsWith('W');
                    const cleaned = f.slot.replace('W', '');
                    for (let i = 0; i < cleaned.length; i++) {
                        const char = cleaned[i];
                        let lvl = 0;
                        if (char === '①') lvl = 1; else if (char === '②') lvl = 2; else if (char === '③') lvl = 3; else if (char === '④') lvl = 4;
                        if (lvl > 0) tSlots.push({ lvl, type: (isW && i === 0) ? 'w' : 'a' });
                    }
                }
                relevantTalismans.push({
                    name: `お気に入り護石 (R${f.rare})`,
                    skills: relSkills,
                    slots: tSlots,
                    defense: 0,
                    p: 'talisman'
                });
            });
        } else {
            const tRareVal = tRareSelect.value;
            const tSlotValFilter = tSlotSelect.value;
            const filterS1 = tSkillSelects[0].value;
            const filterS2 = tSkillSelects[1].value;
            const filterS3 = tSkillSelects[2].value;

            // ★リストのスキルを読み込む
            const favoriteSkills = JSON.parse(localStorage.getItem('mhwilds_fav_skills') || '[]');
            const favoriteSkillSet = new Set(favoriteSkills);

            TALISMAN_COMBINATIONS.forEach(comb => {
                const isManualMode = !autoTalisman && !isFavSkillsMode;
                if (isManualMode && tRareVal !== 'any' && comb.rare != tRareVal) return;
                
                const patternSlots = TALISMAN_SLOTS[`RARE${comb.rare}`] || [];
                patternSlots.forEach(slotStr => {
                    if (isManualMode && tSlotValFilter !== 'any' && slotStr !== tSlotValFilter) return;
                    
                    const choices = [comb.s1, comb.s2, comb.s3].filter(g => g !== null);
                    const groupOptions = choices.map((gid, idx) => {
                        const filter = [filterS1, filterS2, filterS3][idx];
                        let skills = TALISMAN_GROUPS[gid] || [];
                        
                        if (isManualMode && filter !== 'any' && filter !== undefined) {
                            const [fName, fLvl] = filter.split('|');
                            const match = skills.find(s => s.name === fName && s.level == fLvl);
                            return match ? [match] : [];
                        }
                        
                        // ★スキルモードまたは自動選択モードにおける候補スキル
                        let relevant = skills.filter(s => {
                            const found = SKILL_BY_NAME[s.name];
                            const sid = found ? found.id : null;
                            const inTarget = sid && targetPoints[sid];
                            const inFav = favoriteSkillSet.has(`${s.name}|${s.level}`);
                            return inTarget || inFav;
                        });

                        if (relevant.length === 0) return [{ name: "None", level: 0 }];
                        return relevant;
                    });

                    if (groupOptions.some(opts => opts.length === 0)) return;

                    const combos = [[]];
                    groupOptions.forEach(opts => {
                        const next = [];
                        combos.forEach(c => {
                            opts.forEach(o => {
                                if (o.name !== "None" && c.some(existing => existing.name === o.name)) return;
                                next.push([...c, o]);
                            });
                        });
                        combos.splice(0, combos.length, ...next);
                    });

                    combos.forEach(combo => {
                        const tSkills = {};
                        let hasFavSkill = false;
                        
                        combo.forEach(s => {
                            if (s.name !== "None") {
                                const found = SKILL_BY_NAME[s.name];
                                if (found) tSkills[found.id] = (tSkills[found.id] || 0) + s.level;
                                if (favoriteSkillSet.has(`${s.name}|${s.level}`)) hasFavSkill = true;
                            }
                        });

                        // ★リストモードの場合、★スキルを一つも含まないパターンは除外
                        if (isFavSkillsMode && !hasFavSkill) return;

                        const isW = slotStr.startsWith('W');
                        const cleaned = slotStr.replace('W', '');
                        const tSlots = [];
                        for (let i = 0; i < cleaned.length; i++) {
                            const char = cleaned[i];
                            let lvl = 0;
                            if (char === '①') lvl = 1; else if (char === '②') lvl = 2; else if (char === '③') lvl = 3; else if (char === '④') lvl = 4;
                            if (lvl > 0) tSlots.push({ lvl, type: (isW && i === 0) ? 'w' : 'a' });
                        }
                        relevantTalismans.push({ name: `RARE${comb.rare}護石 (${slotStr})`, skills: tSkills, slots: tSlots, defense: 0, p: 'talisman' });
                    });
                });
            });
        }

        statusText.innerHTML = '<span class="loader"></span>装備データを絞り込み中...';
        await new Promise(r => setTimeout(r, 50));

        try {
            const headList = prune(armorParts.head, targetPoints);
            const chestList = prune(armorParts.chest, targetPoints);
            const armsList = prune(armorParts.arms, targetPoints);
            const waistList = prune(armorParts.waist, targetPoints);
            const legsList = prune(armorParts.legs, targetPoints);
            const talismanList = prune(relevantTalismans, targetPoints);
            const parts = [headList, chestList, armsList, waistList, legsList, talismanList];

            const allResults = [];
            const maxRemainSkills = Array(6).fill(0).map(() => ({}));
            const maxRemainSlots = Array(6).fill(0);
            for (let i = 5; i >= 0; i--) {
                const partMax = {};
                let partMaxSlots = 0;
                parts[i].forEach(p => {
                    Object.keys(targetPoints).forEach(sid => { if ((p.skills[sid] || 0) > (partMax[sid] || 0)) partMax[sid] = p.skills[sid]; });
                    const slotTotal = (p.slots || []).reduce((sum, s) => sum + (s.lvl || s || 0), 0);
                    if (slotTotal > partMaxSlots) partMaxSlots = slotTotal;
                });
                Object.keys(targetPoints).forEach(sid => { maxRemainSkills[i][sid] = (partMax[sid] || 0) + (i < 5 ? maxRemainSkills[i + 1][sid] : 0); });
                maxRemainSlots[i] = partMaxSlots + (i < 5 ? maxRemainSlots[i + 1] : 0);
            }

            const decoBySkill = {};
            const canBeDeco = {};
            DECORATIONS.forEach(d => {
                d.sk.forEach(s => {
                    const skId = SKILL_NAME_TO_ID[s.n];
                    if (skId && targetPoints[skId]) {
                        if (!decoBySkill[skId]) decoBySkill[skId] = [];
                        decoBySkill[skId].push({ ...d, pts: s.l, lvl: d.sl, type: d.t, name: d.n });
                        canBeDeco[skId] = true;
                    }
                });
            });
            for (const sid in decoBySkill) decoBySkill[sid].sort((a, b) => b.pts / b.lvl - a.pts / a.lvl || b.pts - a.pts);

            let resultsCount = 0;
            let uniqueSetCount = 0;
            const uniqueSetCountedKeys = new Set();
            let isInterrupted = false;

            const stack = [{ part: 0, currentSkills: { ...wSkills }, currentItems: [] }];
            let baseWeaponPotential = wSlots.reduce((a, b) => a + (b.lvl || b || 0), 0);

            let currentSearchTimeout = null;
            function solveChunkDFS() {
                try {
                    const startTime = Date.now();
                    while (stack.length > 0) {
                        const node = stack.pop();
                        const pIdx = node.part;

                        if (pIdx === 6) {
                            const [h, c, a, w, l, t] = node.currentItems;
                            const key = `${h.id}-${c.id}-${a.id}-${w.id}-${l.id}`;
                            const assignment = check(h, c, a, w, l, t, targetPoints, wSlots, wSkills, decoBySkill);
                            if (assignment) {
                                allResults.push({ h, c, a, w, l, t, assignment });
                                if (uniqueSetCountedKeys && !uniqueSetCountedKeys.has(key)) {
                                    uniqueSetCountedKeys.add(key);
                                    uniqueSetCount++;
                                }
                            }
                            if (uniqueSetCount >= 30) {
                                isInterrupted = true;
                                break;
                            }
                        } else {
                            const currentPartItems = parts[pIdx];
                            for (let i = currentPartItems.length - 1; i >= 0; i--) {
                                const item = currentPartItems[i];
                                let possible = true;
                                const itemSlotsVal = (item.slots || []).reduce((sum, s) => sum + (s.lvl || s || 0), 0);
                                const remSlotsVal = (pIdx < 5 ? maxRemainSlots[pIdx + 1] : 0);
                                const totalPotentialSlotsVal = itemSlotsVal + remSlotsVal + baseWeaponPotential;

                                for (const sid in targetPoints) {
                                    const cur = (node.currentSkills[sid] || 0) + (item.skills[sid] || 0);
                                    const remMax = (pIdx < 5 ? maxRemainSkills[pIdx + 1][sid] : 0);
                                    const fixedW = wSkills[sid] || 0;
                                    const isAutoCat = (SKILL_BY_ID[sid].mainCategory === 'series' && wSkills.auto_ss) || (SKILL_BY_ID[sid].mainCategory === 'group' && wSkills.auto_gs);
                                    const wPot = isAutoCat ? 1 : 0;
                                    const potential = canBeDeco[sid] ? (remMax + totalPotentialSlotsVal + wPot) : (remMax + wPot);
                                    if (cur + fixedW + potential < targetPoints[sid]) {
                                        const targetDebugNames = ['クイーンピアスα', 'エグゾルスメイルγ', '護火竜アームβ', '護火竜コイルβ', 'トゥナムルグリーヴγ'];
                                        if (node.currentItems.every(it => targetDebugNames.includes(it.name)) && targetDebugNames.includes(item.name)) {
                                            console.log(`[DEBUG] Pruned Branch in DFS! Skill: ${SKILL_BY_ID[sid].name}, Needed: ${targetPoints[sid]}, Current: ${cur + fixedW}, Potential: ${potential}`);
                                        }
                                        possible = false; break;
                                    }
                                }

                                if (possible) {
                                    const nextSkills = { ...node.currentSkills };
                                    Object.keys(item.skills).forEach(sid => { nextSkills[sid] = (nextSkills[sid] || 0) + item.skills[sid]; });
                                    stack.push({ part: pIdx + 1, currentSkills: nextSkills, currentItems: [...node.currentItems, item] });
                                }
                            }
                        }
                        if (Date.now() - startTime > 40) {
                            statusText.innerHTML = `<span class="loader"></span>検索中... ${resultsCount}件抽出済 (残スタック量: ${stack.length})`;
                            currentSearchTimeout = setTimeout(solveChunkDFS, 0);
                            return;
                        }
                    }
                    if (isInterrupted) {
                        statusText.innerHTML = '<span style="color:var(--accent-color); font-weight:bold;">⚠ 検索結果が30件を超えたため中断しました。条件をさらに絞り込んでください。</span>';
                    }
                    finish(allResults, isInterrupted);
                } catch (e) {
                    console.error("solveChunkDFS Error:", e);
                    statusText.innerHTML = `<span style="color:red">検索中のエラー(DFS): ${e.message}</span>`;
                }
            }

            function check(h, c, a, w, l, t, tPoints, wS, wSkills, deccos) {
                const pts = {};
                for (const sid in tPoints) {
                    pts[sid] = (h.skills[sid] || 0) + (c.skills[sid] || 0) + (a.skills[sid] || 0) + (w.skills[sid] || 0) + (l.skills[sid] || 0) + (t.skills[sid] || 0);
                    if (wSkills[sid]) pts[sid] += wSkills[sid];
                }

                const missing = {};
                for (const sid in tPoints) {
                    const diff = tPoints[sid] - (pts[sid] || 0);
                    if (diff > 0) missing[sid] = diff;
                }

                let usedAutoSS = null;
                let usedAutoGS = null;

                if (wSkills.auto_ss) {
                    const ssMissing = Object.keys(missing).filter(id => SKILL_BY_ID[id].mainCategory === 'series');
                    if (ssMissing.length === 1 && missing[ssMissing[0]] === 1) {
                        usedAutoSS = ssMissing[0]; delete missing[usedAutoSS];
                    } else if (ssMissing.length === 0) { } else return null;
                }
                if (wSkills.auto_gs) {
                    const gsMissing = Object.keys(missing).filter(id => SKILL_BY_ID[id].mainCategory === 'group');
                    if (gsMissing.length === 1 && missing[gsMissing[0]] === 1) {
                        usedAutoGS = gsMissing[0]; delete missing[usedAutoGS];
                    } else if (gsMissing.length === 0) { } else return null;
                }

                const totalNeeded = Object.values(missing).reduce((a, b) => a + b, 0);
                if (totalNeeded === 0) return { decos: [], autoSS: usedAutoSS, autoGS: usedAutoGS };

                const slotObjects = [];
                [h, c, a, w, l].forEach((item, idx) => {
                    item.slots.filter(s => (s.lvl || s) > 0).forEach(s => {
                        slotObjects.push({ piece: idx, lvl: s.lvl || s, type: 'a' });
                    });
                });
                wS.forEach(s => {
                    if (s > 0) slotObjects.push({ piece: 'weapon', lvl: s, type: 'w' });
                });
                t.slots.forEach(s => {
                    const lvl = s.lvl || s;
                    if (lvl > 0) slotObjects.push({ piece: 'talisman', lvl, type: s.type || 'a' });
                });
                slotObjects.sort((x, y) => x.lvl - y.lvl);

                const decosUsed = [];
                if (canFillWithTracking(missing, slotObjects, deccos, decosUsed)) return { decos: decosUsed, autoSS: usedAutoSS, autoGS: usedAutoGS };
                return null;
            }

            function canFillWithTracking(missing, slots, deccos, decosUsed) {
                const missingIds = Object.keys(missing);
                if (missingIds.length === 0) return true;
                const skillId = missingIds[0];
                const ptsNeeded = missing[skillId];
                const usable = deccos[skillId] || [];
                if (usable.length === 0) return false;

                return (function branchFill(id, nPts, curSlots, dIdx) {
                    if (nPts <= 0) { const nextMissing = { ...missing }; delete nextMissing[id]; return canFillWithTracking(nextMissing, curSlots, deccos, decosUsed); }
                    if (dIdx >= usable.length) return false;
                    const deco = usable[dIdx];
                    const sIdx = curSlots.findIndex(s => s.lvl >= deco.lvl && s.type === deco.type);
                    if (sIdx === -1) return branchFill(id, nPts, curSlots, dIdx + 1);
                    const nextSlots = [...curSlots]; const usedSlot = nextSlots.splice(sIdx, 1)[0];
                    decosUsed.push({ deco, piece: usedSlot.piece });
                    if (branchFill(id, nPts - deco.pts, nextSlots, dIdx)) return true;
                    decosUsed.pop();
                    return branchFill(id, nPts, curSlots, dIdx + 1);
                })(skillId, ptsNeeded, slots, 0);
            }

            function calculateFinalStats(h, c, a, w, l, t, assignment, ws, wSk, aSS, aGS) {
                let def = (h.d || 0) + (c.d || 0) + (a.d || 0) + (w.d || 0) + (l.d || 0);
                let res = [0, 0, 0, 0, 0];
                [h, c, a, w, l].forEach(p => { if (p.r) p.r.forEach((v, i) => res[i] += v); });

                // 初期値を0から計算（武器攻撃力・会心が渡されていない場合は0ベース）
                const params = new URLSearchParams(window.location.search);
                let atk = parseInt(params.get('base_atk') || "0", 10);
                let aff = parseInt(params.get('base_aff') || "0", 10);
                let atkMult = 1.0;
                let critMult = 1.25;

                const pts = {};
                const addP = (sid, n) => { if (sid) pts[sid] = (pts[sid] || 0) + n; };
                [h, c, a, w, l].forEach(item => {
                    if (item.sk) item.sk.forEach(s => addP(SKILL_NAME_TO_ID[s.n], s.l));
                    if (item.ss) { item.ss.split(',').forEach(sn => addP(SKILL_NAME_TO_ID[sn.trim()], 1)); }
                    if (item.gs) { item.gs.split(',').forEach(sn => addP(SKILL_NAME_TO_ID[sn.trim()], 1)); }
                });
                Object.entries(t.skills).forEach(([sid, n]) => addP(sid, n));
                Object.entries(wSk).forEach(([sid, n]) => { if (sid !== 'auto_ss' && sid !== 'auto_gs') addP(sid, n); });
                if (aSS) addP(aSS, 1);
                if (aGS) addP(aGS, 1);
                assignment.forEach(d => { if (d.deco.sk) d.deco.sk.forEach(s => addP(SKILL_NAME_TO_ID[s.n], s.l)); });
                
                Object.entries(pts).forEach(([sid, n]) => {
                    const s = SKILL_BY_ID[sid];
                    if (!s) return;
                    const lvl = Math.min(n, s.maxLevel);
                    const eff = s.effects && s.effects.find(e => e.level === lvl);
                    if (eff) {
                        if (eff.defAdd) def += eff.defAdd;
                        if (eff.attackAdd) atk += eff.attackAdd;
                        if (eff.atkAdd) atk += eff.atkAdd;
                        if (eff.attackMult) atkMult *= (1 + eff.attackMult);
                        if (eff.affinity) aff += eff.affinity;
                        if (eff.critMultAdd) critMult += eff.critMultAdd;
                        if (eff.resAdd) {
                            const rIds = ['fire_resistance', 'water_resistance', 'thunder_resistance', 'ice_resistance', 'dragon_resistance'];
                            const idx = rIds.indexOf(sid);
                            if (idx !== -1) res[idx] += eff.resAdd;
                        }
                    }
                });

                const finalAtk = atk * atkMult;
                const finalAff = aff;
                
                // 期待値は攻撃力と会心率の情報のみで算出 (物理期待値 = 攻撃力 * (1 + 0.25 * 会心率/100))
                const exp = finalAtk * (1 + (finalAff / 100) * 0.25);

                return {
                    def,
                    res,
                    atk: Math.floor(finalAtk),
                    aff: finalAff,
                    exp: Math.round(exp * 10) / 10
                };
            }


            function finish(results, interrupted = false) {
                progressBar.style.width = '100%';
                const sortType = document.getElementById('search-sort-type').value;

                const processed = results.map(r => ({
                    ...r,
                    stats: calculateFinalStats(r.h, r.c, r.a, r.w, r.l, r.t, r.assignment.decos, wSlots, wSkills, r.assignment.autoSS, r.assignment.autoGS)
                }));

                const filtered = processed.filter(r => {
                    for (const [idx, val] of activeResFilters.entries()) {
                        if (r.stats.res[idx] < val) return false;
                    }
                    return true;
                });

                const groups = new Map();
                filtered.forEach(r => {
                    const key = `${r.h.n}-${r.c.n}-${r.a.n}-${r.w.n}-${r.l.n}`;
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key).push(r);
                });

                const uniqueResults = [];
                groups.forEach(vs => { vs.sort((a, b) => (a.t.rare || 5) - (b.t.rare || 5)); uniqueResults.push(vs[0]); });

                if (sortType === 'exp') uniqueResults.sort((a, b) => b.stats.exp - a.stats.exp);
                else if (sortType === 'def') uniqueResults.sort((a, b) => b.stats.def - a.stats.def);
                else if (sortType.startsWith('res')) {
                    const ri = parseInt(sortType.replace('res', ''));
                    uniqueResults.sort((a, b) => b.stats.res[ri] - a.stats.res[ri]);
                }

                resultsContainer.innerHTML = '';
                uniqueResults.slice(0, 100).forEach((r, idx) => {
                    renderResult(r.h, r.c, r.a, r.w, r.l, r.t, wSlots, wSkills, r.assignment.decos, idx + 1, target, armorLabels, r.assignment.autoSS, r.assignment.autoGS, r.stats, manualWDecos, fullWSlots);
                });

                resultCountEl.textContent = `${uniqueResults.length} sets`;
                if (!interrupted) {
                    statusText.textContent = `検索完了! ${uniqueResults.length}種類の装備構成が見つかりました。${results.length > uniqueResults.length ? ` (全${results.length}パターンから集約表示)` : ''}`;
                }

                // 「追加可能なスキル」の解析 (上位30件対象)
                const addableSkillsSet = new Map(); // skillId -> count
                uniqueResults.slice(0, 30).forEach(r => {
                    const hS = r.h.slots.map(s => ({ lvl: s.lvl || s, type: 'a' }));
                    const cS = r.c.slots.map(s => ({ lvl: s.lvl || s, type: 'a' }));
                    const aS = r.a.slots.map(s => ({ lvl: s.lvl || s, type: 'a' }));
                    const wS_part = r.w.slots.map(s => ({ lvl: s.lvl || s, type: 'a' }));
                    const lS = r.l.slots.map(s => ({ lvl: s.lvl || s, type: 'a' }));
                    const tS = r.t.slots.map(s => ({ lvl: s.lvl || s, type: s.type || 'a' }));
                    const wSlotFixed = wSlots.map(s => ({ lvl: s, type: 'w' }));
                    
                    const totalSlots = [...hS, ...cS, ...aS, ...wS_part, ...lS, ...tS, ...wSlotFixed].filter(s => s.lvl > 0);
                    // 使ったスロットを除く
                    r.assignment.decos.forEach(d => {
                        const idx = totalSlots.findIndex(ts => ts.lvl >= d.deco.lvl && ts.type === d.deco.type);
                        if (idx !== -1) totalSlots.splice(idx, 1);
                    });
                    
                    // 空きスロットがある場合のみ解析
                    if (totalSlots.length > 0) {
                        SKILLS.forEach(s => {
                            if (s.mainCategory !== 'weapon' && s.mainCategory !== 'armor') return;
                            const currentLv = targetSkills[s.id] || 0;
                            if (currentLv >= s.maxLevel) return;
                            
                            // このスキルを上げられるか装飾品でチェック
                            const usableDecos = (decoBySkill[s.id] || []).filter(d => totalSlots.some(ts => ts.lvl >= d.lvl && ts.type === d.type));
                            if (usableDecos.length > 0) {
                                addableSkillsSet.set(s.id, (addableSkillsSet.get(s.id) || 0) + 1);
                            }
                        });
                    }
                });

                if (addableSkillsSet.size > 0) {
                    const topAddable = Array.from(addableSkillsSet.entries())
                        .map(([sid, count]) => ({ id: sid, count, name: SKILL_BY_ID[sid].name }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 10);

                    const summaryEl = document.getElementById('target-summary');
                    if (summaryEl) {
                        const addableArea = document.createElement('div');
                        addableArea.style.marginTop = '1rem';
                        addableArea.style.width = '100%';
                        addableArea.style.padding = '0.8rem';
                        addableArea.style.background = 'rgba(255, 204, 0, 0.05)';
                        addableArea.style.border = '1px dashed rgba(255, 204, 0, 0.3)';
                        addableArea.style.borderRadius = '4px';
                        
                        let html = `<div style="font-size: 0.8rem; color: var(--accent-color); margin-bottom: 0.5rem; font-weight: bold;">
                                        <span style="font-size:1rem">💡</span> 抽出された構成にさらに追加可能なスキル（目安）:
                                     </div><div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">`;
                        
                        topAddable.forEach(x => {
                            html += `<button class="btn add-suggest-btn" data-sid="${x.id}" style="font-size: 0.7rem; padding: 2px 8px; background: rgba(255,255,255,0.05); border: 1px solid #444; color: #eee; cursor:pointer;" title="${x.count}個の構成で追加可能">＋ ${x.name}</button>`;
                        });
                        html += `</div>`;
                        addableArea.innerHTML = html;
                        summaryEl.appendChild(addableArea);
                        
                        // ボタンクリックでスキルを選択
                        addableArea.querySelectorAll('.add-suggest-btn').forEach(btn => {
                            btn.onclick = () => {
                                const sid = btn.dataset.sid;
                                const select = cachedSkillSelects[sid];
                                if (select) {
                                    const current = parseInt(select.value);
                                    if (current < select.options.length - 1) {
                                        select.value = current + 1;
                                        select.dispatchEvent(new Event('change'));
                                        // 自動で再検索される
                                        startSearch();
                                    }
                                }
                            };
                        });
                    }
                }
            }

            solveChunkDFS();
        } catch (setupErr) {
            console.error("Setup Error:", setupErr);
            statusText.innerHTML = `<span style="color:red">エラー: ${setupErr.message}</span>`;
        }
    }

    function renderResult(h, c, a, w, l, t, wSlots, wSkills, assignment, idx, target, labels, autoSS, autoGS, stats, manualWDecos, fullWSlots) {
        const card = document.createElement('div');
        card.className = 'result-card' + (idx === 1 ? ' best-match' : '');
        const armorItems = [h, c, a, w, l];
        
        const weaponNameDisplay = (autoSS || autoGS || h.ss || h.gs) ? "巨戟アーティア" : "その他";

        const getWeaponSlotsHtml = () => {
            let html = [];
            let autoIdx = 0;
            fullWSlots.forEach((size, i) => {
                const manual = manualWDecos[i];
                if (manual) {
                    html.push(`<div class="slots-row"><span class="slot-box">[${size}]</span> <span class="deco-label">${manual.n}</span></div>`);
                } else {
                    const assigned = assignment.find(d => d.piece === 'weapon' && d.usedInIdx === undefined);
                    if (assigned) {
                        assigned.usedInIdx = i; // Mark as used
                        html.push(`<div class="slots-row"><span class="slot-box">[${size}]</span> <span class="deco-label">${assigned.deco.name}</span></div>`);
                    } else {
                        html.push(`<div class="slots-row"><span class="slot-box">[${size}]</span></div>`);
                    }
                }
            });
            // Clear markers for next render if any
            assignment.forEach(d => delete d.usedInIdx);
            return html.join('');
        };

        const getDecoLabels = (pid) => {
            let labelsHtml = [];
            assignment.filter(d => d.piece === pid).forEach(d => labelsHtml.push(`<span class="deco-label">${d.deco.name}</span>`));
            return labelsHtml.join(' ');
        };

        const getPieceSkillsHtml = (item) => {
            const tags = [];
            if (item.sk) item.sk.forEach(s => tags.push(`<span class="piece-skill-label">${s.n} Lv${s.l}</span>`));
            if (item.ss) tags.push(`<span class="piece-skill-label special-ss">[S] ${item.ss}</span>`);
            if (item.gs) tags.push(`<span class="piece-skill-label special-gs">[G] ${item.gs}</span>`);
            return tags.join(' ');
        };

        const getWeaponSkillsHtml = () => {
            const tags = [];
            if (autoSS) tags.push(`<span class="piece-skill-label special-ss">[S] ${SKILL_BY_ID[autoSS].name}</span>`);
            if (autoGS) tags.push(`<span class="piece-skill-label special-gs">[G] ${SKILL_BY_ID[autoGS].name}</span>`);
            Object.entries(wSkills).forEach(([sid, pts]) => {
                if (sid === 'auto_ss' || sid === 'auto_gs') return;
                const s = SKILL_BY_ID[sid];
                if (s && sid !== autoSS && sid !== autoGS) {
                    if (s.mainCategory === 'series') tags.push(`<span class="piece-skill-label special-ss">[S] ${s.name}</span>`);
                    else if (s.mainCategory === 'group') tags.push(`<span class="piece-skill-label special-gs">[G] ${s.name}</span>`);
                    else tags.push(`<span class="piece-skill-label">${s.name} Lv${pts}</span>`);
                }
            });
            return tags.join(' ');
        };

        // 合計集計とソート (共有ロジックを使用)
        const matrix = buildSkillMatrix({ h, c, a, w, l, t }, wSkills, assignment, SKILL_NAME_TO_ID, autoSS, autoGS);
        const activatedRows = sortActivatedSkills(matrix, SKILLS, SKILL_BY_ID);

        const renderVal = (v) => v > 0 ? v : '<span class="empty-cell">-</span>';

        card.innerHTML = `
            <div class="result-header" style="display: flex; align-items: center; padding: 10px 15px; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,215,0,0.2);">
                <span class="set-id-tag" style="margin-right: 20px; color: var(--accent-color); font-weight: bold;">SET #${idx}</span>
                <div class="defense-info" style="font-size: 0.95rem; letter-spacing: 0.05em; color: #eee; flex: 1;">
                    <span style="color: #aaa;">期待値:</span> <span class="stat-val" style="color:var(--accent-color); margin-right: 1.5rem;">${stats.exp}</span>
                    <span style="color: #aaa;">攻撃力:</span> <span class="stat-val" style="margin-right: 1.5rem;">${stats.atk}</span>
                    <span style="color: #aaa;">会心率:</span> <span class="stat-val" style="margin-right: 1.5rem;">${stats.aff}%</span>
                    <span style="color: #aaa;">防御力:</span> <span class="stat-val" style="margin-right: 1.5rem;">${stats.def}</span>
                    <span style="color: #aaa;">耐性:</span> <span class="stat-val">${stats.res[0]} / ${stats.res[1]} / ${stats.res[2]} / ${stats.res[3]} / ${stats.res[4]}</span>
                </div>
            </div>

            <div class="result-body">
                <div class="equipment-list">
                    <!-- 武器 -->
                    <div class="equip-item">
                        <div class="equip-label">武</div>
                        <div class="equip-name">${weaponNameDisplay}</div>
                        <div class="equip-sub">防: -- &nbsp; 耐: --/--/--/--/--</div>
                        <div class="native-skills">${getWeaponSkillsHtml()}</div>
                        <div class="slots-stack">
                            ${getWeaponSlotsHtml()}
                        </div>
                    </div>
                    <!-- 防具各部 -->
                    ${armorItems.map((item, i) => `
                        <div class="equip-item">
                            <div class="equip-label">${labels[i]}</div>
                            <div class="equip-name">${item.n}</div>
                            <div class="equip-sub">防: <span class="stat-val">${item.d}</span> &nbsp; 耐: <span class="stat-val">${item.r ? item.r.join('/') : '-'}</span></div>
                            <div class="native-skills">${getPieceSkillsHtml(item)}</div>
                            <div class="slots-row">
                                ${item.sl ? item.sl.filter(s => s > 0).map(s => `<span class="slot-box">[${s}]</span>`).join('') : ''}
                                <span class="decos-inline">${getDecoLabels(i)}</span>
                            </div>
                        </div>
                    `).join('')}
                    <!-- 護石 -->
                    <div class="equip-item">
                        <div class="equip-label">石</div>
                        <div class="equip-name">${t.name}</div>
                        <div class="equip-sub">防: 0</div>
                        <div class="native-skills">
                            ${Object.entries(t.skills).map(([sid, pts]) => `<span class="piece-skill-label">${SKILL_BY_ID[sid]?.name || sid} +${pts}</span>`).join(' ')}
                        </div>
                        <div class="slots-row">
                            ${t.slots.map(s => `<span class="slot-box">[${s.lvl}]</span>`).join('')}
                            <span class="decos-inline">${getDecoLabels('talisman')}</span>
                        </div>
                    </div>
                </div>
                <!-- 右側：スキル合計テーブル -->
                <div class="totals-panel">
                    <table class="skill-table">
                        <thead>
                            <tr>
                                <th class="skill-name-cell">スキル合計</th>
                                <th>武</th><th>頭</th><th>胴</th><th>腕</th><th>腰</th><th>脚</th><th>石</th>
                                <th class="total-header">計</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activatedRows.map(r => `
                                <tr>
                                    <td class="skill-name-cell">${r.name}</td>
                                    <td class="val-cell">${renderVal(r.m.weapon)}</td>
                                    <td class="val-cell">${renderVal(r.m[0])}</td>
                                    <td class="val-cell">${renderVal(r.m[1])}</td>
                                    <td class="val-cell">${renderVal(r.m[2])}</td>
                                    <td class="val-cell">${renderVal(r.m[3])}</td>
                                    <td class="val-cell">${renderVal(r.m[4])}</td>
                                    <td class="val-cell">${renderVal(r.m.talisman)}</td>
                                    <td class="total-cell">${r.lvlText}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-save-set';
        saveBtn.style.cssText = 'margin-left: auto; font-size: 0.7rem; padding: 4px 10px; background: rgba(0, 255, 127, 0.1); border: 1px solid rgba(0, 255, 127, 0.3); color: #00ff7f;';
        saveBtn.textContent = 'セット保存';
        saveBtn.onclick = () => {
            const setName = prompt('マイセット（計算機と共有）としての保存名を入力してください:', `セット#${idx}`);
            if (!setName) return;
            
            const sets = JSON.parse(localStorage.getItem('mhwilds_mysets') || '{}');
            // 計算機ページ(main.js)の形式に合わせてデータを構成
            const data = {
                currentSkillLevels: { ...target },
                weaponTypeId: document.getElementById('weapon-type-select')?.value || 'gs',
                timestamp: Date.now(),
                // アーティア初期設定 (最強攻撃構成)
                excitationType: 'attack',
                parts: ['attack', 'attack', 'attack'],
                bonuses: ['atk_3', 'atk_3', 'atk_ex', 'atk_ex', 'sharp_load_ex'],
                asst_build_data: {
                    h: h.n, c: c.n, a: a.n, w: w.n, l: l.n, t: t.name,
                    decos: assignment.map(d => ({ n: d.deco.name, p: d.piece })),
                    autoSS: autoSS, autoGS: autoGS
                }
            };
            sets[setName] = data;
            localStorage.setItem('mhwilds_mysets', JSON.stringify(sets));
            updateMySetList();
            alert(`「${setName}」を計算機ページのマイセットとして保存しました。`);
        };
        card.querySelector('.result-header').appendChild(saveBtn);

        resultsContainer.appendChild(card);
    }

    // --- MySet System (Shared with Calculator) ---
    const MYSET_STORAGE_KEY = 'mhwilds_mysets';
    let currentLoadedMySetName = null;

    function getMySets() {
        try { return JSON.parse(localStorage.getItem(MYSET_STORAGE_KEY) || '{}'); } catch(e) { return {}; }
    }

    function updateMySetList() {
        const mySetList = document.getElementById('myset-list');
        const display = document.getElementById('current-myset-display');
        if (!mySetList) return;
        const sets = getMySets();
        mySetList.innerHTML = '<option value="">マイセット選択...</option>';
        Object.keys(sets).sort().forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            mySetList.appendChild(opt);
        });
        if (currentLoadedMySetName) {
            mySetList.value = currentLoadedMySetName;
            display.textContent = currentLoadedMySetName;
        } else {
            display.textContent = '(未保存)';
        }
    }

    document.getElementById('btn-load-myset')?.addEventListener('click', () => {
        const name = document.getElementById('myset-list').value;
        if (!name) return;
        const sets = getMySets();
        const data = sets[name];
        if (!data || (!data.currentSkillLevels && !data.skills)) return;

        // スキル選択状態をリセット (物理的・内部的)
        Object.keys(targetSkills).forEach(sid => delete targetSkills[sid]);
        Object.values(cachedSkillSelects).forEach(s => {
            s.value = 0;
            s.closest('.skill-selector-row')?.classList.remove('selected');
        });
        
        // 保存されたスキルを適用
        const skillData = data.currentSkillLevels || data.skills || {};
        Object.entries(skillData).forEach(([sid, lvl]) => {
            if (cachedSkillSelects[sid]) {
                const sel = cachedSkillSelects[sid];
                sel.value = lvl;
                if (lvl > 0) {
                    sel.closest('.skill-selector-row')?.classList.add('selected');
                    targetSkills[sid] = lvl;
                }
            }
        });
        
        currentLoadedMySetName = name;
        updateMySetList();
        updateActiveSkillsUI();
        updateTargetSummary();
        alert(`マイセット「${name}」のスキル構成を読み込みました。`);
        // 読込時に自動検索は行わない（反映のみ）
    });

    document.getElementById('btn-save-myset')?.addEventListener('click', () => {
        const name = prompt('現在の検索条件（スキル構成）をマイセットとして保存します。名前を入力してください:', currentLoadedMySetName || '');
        if (!name) return;
        const sets = getMySets();
        sets[name] = {
            currentSkillLevels: { ...targetSkills },
            timestamp: Date.now()
        };
        localStorage.setItem(MYSET_STORAGE_KEY, JSON.stringify(sets));
        currentLoadedMySetName = name;
        updateMySetList();
        alert(`「${name}」を保存しました。計算機ページでも読み込み可能です。`);
    });

    document.getElementById('btn-delete-myset')?.addEventListener('click', () => {
        const name = document.getElementById('myset-list').value;
        if (!name || !confirm(`マイセット「${name}」を削除しますか？`)) return;
        const sets = getMySets();
        delete sets[name];
        localStorage.setItem(MYSET_STORAGE_KEY, JSON.stringify(sets));
        if (currentLoadedMySetName === name) currentLoadedMySetName = null;
        updateMySetList();
    });

    updateMySetList();

});

