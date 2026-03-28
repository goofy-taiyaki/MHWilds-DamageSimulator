import { ARMOR } from './data/armor.js';
import { DECORATIONS } from './data/decorations.js';
import { SKILLS } from './data/skills.js';
import { TALISMAN_GROUPS, TALISMAN_COMBINATIONS, TALISMAN_SLOTS } from './data/talisman.js';

const SKILL_NAME_TO_ID = Object.fromEntries(SKILLS.map(s => [s.name, s.id]));
const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s, idx) => [s.id, { ...s, originalIndex: idx }]));
const SKILL_BY_NAME = Object.fromEntries(SKILLS.map((s, idx) => [s.name, { ...s, originalIndex: idx }]));

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
        currentPickingSlot = slotIdx;
        modal.style.display = 'flex';
        overlay.style.display = 'block';
        searchInput.value = '';
        renderPickerList('');
    };

    const closePicker = () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };

    const renderPickerList = (query) => {
        decoList.innerHTML = '<div class="deco-pick-item none" data-did="">未選択 (クリア)</div>';
        const filtered = DECORATIONS.filter(d => {
            if (d.lvl > 3) return false;
            if (!query) return true;
            return (d.name.includes(query) || (d.sk && d.sk.some(s => s.n.includes(query))));
        });
        filtered.forEach(d => {
            const el = document.createElement('div');
            el.className = 'deco-pick-item';
            el.textContent = `${d.name} [${d.lvl}]`;
            el.dataset.did = d.sk && d.sk[0] ? d.sk[0].n : d.name;
            el.addEventListener('click', () => {
                weaponDecos[currentPickingSlot-1] = d;
                document.getElementById(`wdeco-${currentPickingSlot}`).textContent = d.name;
                closePicker();
            });
            decoList.appendChild(el);
        });
        const noneBtn = decoList.querySelector('.none');
        if (noneBtn) {
            noneBtn.addEventListener('click', () => {
                weaponDecos[currentPickingSlot-1] = null;
                document.getElementById(`wdeco-${currentPickingSlot}`).textContent = '未選択';
                closePicker();
            });
        }
    };

    [1,2,3].forEach(i => {
        const el = document.getElementById(`wdeco-${i}`);
        if(el) el.addEventListener('click', () => openPicker(i));
    });

    document.getElementById('deco-picker-close')?.addEventListener('click', closePicker);
    overlay?.addEventListener('click', closePicker);
    searchInput?.addEventListener('input', (e) => renderPickerList(e.target.value));

    const weaponSsSelect = document.getElementById('weapon-ss');
    const weaponGsSelect = document.getElementById('weapon-gs');

    if (weaponSsSelect && weaponGsSelect) {
        SKILLS.filter(s => s.mainCategory === 'series').forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            weaponSsSelect.appendChild(opt);
        });
        SKILLS.filter(s => s.mainCategory === 'group').forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            weaponGsSelect.appendChild(opt);
        });
    }

    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const resultCountEl = document.getElementById('result-count');
    const container = document.getElementById('results-container');
    const emptyMessage = document.getElementById('empty-message');
    const btnReSearch = document.getElementById('btn-re-search');

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
        Array.from(groupIds).sort((a,b)=>a-b).forEach(gid => {
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
    }

    // Weapons
    const weaponSlotSelects = ['weapon-slot-1', 'weapon-slot-2', 'weapon-slot-3'].map(id => document.getElementById(id));
    const weaponSkillFilter = document.getElementById('weapon-skill-filter');

    function populateWeaponSkills(filter = '') {
        if (!weaponSsSelect || !weaponGsSelect) return;
        const lowerFilter = filter.toLowerCase();
        
        const ssOptions = SKILLS.filter(s => s.mainCategory === 'series' && (!filter || s.name.toLowerCase().includes(lowerFilter)));
        const gsOptions = SKILLS.filter(s => s.mainCategory === 'group' && (!filter || s.name.toLowerCase().includes(lowerFilter)));
        
        const currentSs = weaponSsSelect.value;
        const currentGs = weaponGsSelect.value;

        weaponSsSelect.innerHTML = '<option value="">武器固有：指定なし</option><option value="auto">【自動選択】</option>';
        weaponGsSelect.innerHTML = '<option value="">武器固有：指定なし</option><option value="auto">【自動選択】</option>';

        ssOptions.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = (targetSkills[s.id] ? '★ ' : '') + s.name;
            weaponSsSelect.appendChild(opt);
        });
        gsOptions.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = (targetSkills[s.id] ? '★ ' : '') + s.name;
            weaponGsSelect.appendChild(opt);
        });

        // Restore selection if possible
        if ([...weaponSsSelect.options].some(o => o.value === currentSs)) weaponSsSelect.value = currentSs;
        if ([...weaponGsSelect.options].some(o => o.value === currentGs)) weaponGsSelect.value = currentGs;
    }

    if (weaponSsSelect && weaponGsSelect) {
        populateWeaponSkills();
        weaponSsSelect.value = 'auto'; // Default to auto
        weaponGsSelect.value = 'auto'; // Default to auto
        if (weaponSkillFilter) {
            weaponSkillFilter.addEventListener('input', (e) => populateWeaponSkills(e.target.value));
        }
    }

    // Call this after targetSkills and populateWeaponSkills are ready
    populateWeaponSkills();
    if (weaponSsSelect) weaponSsSelect.value = 'auto';
    if (weaponGsSelect) weaponGsSelect.value = 'auto';

    let currentSearchTimeout = null;

    function startSearch() {
        if (currentSearchTimeout) clearTimeout(currentSearchTimeout);
        resultsContainer.innerHTML = '';
        emptyMessage.style.display = 'none';
        resultCountEl.textContent = '0 sets';
        progressBar.style.width = '0%';
        
        if (Object.keys(targetSkills).length === 0) {
            statusText.textContent = 'スキル構成が空です。シミュレーターでスキルを選択してください。';
            return;
        }

        const weaponSlots = weaponSlotSelects.map(s => s ? parseInt(s.value, 10) : 0).filter(v => v > 0);
        const weaponSkills = {};
        if (weaponSsSelect && weaponSsSelect.value) {
            if (weaponSsSelect.value === 'auto') weaponSkills.auto_ss = true;
            else weaponSkills[weaponSsSelect.value] = 1;
        }
        if (weaponGsSelect && weaponGsSelect.value) {
            if (weaponGsSelect.value === 'auto') weaponSkills.auto_gs = true;
            else weaponSkills[weaponGsSelect.value] = 1;
        }

        const isAutoTalisman = talismanAutoCheckbox && talismanAutoCheckbox.checked;
        const talismanData = {};
        let talismanSlots = [];
        let talismanName = "お守り";

        if (!isAutoTalisman) {
            tSkillSelects.forEach(s => {
                if (s && s.value !== 'any') {
                    const [name, lvl] = s.value.split('|');
                    const skill = SKILL_BY_NAME[name];
                    if (skill) talismanData[skill.id] = parseInt(lvl, 10);
                }
            });

            const tSlotVal = (tSlotSelect && tSlotSelect.value) || 'any';
            if (tSlotVal !== 'any') {
                const isWeaponSlot = tSlotVal.startsWith('W');
                const cleaned = tSlotVal.replace('W', '');
                for (let char of cleaned) {
                    let lvl = 0;
                    if (char === '①') lvl = 1;
                    else if (char === '②') lvl = 2;
                    else if (char === '③') lvl = 3;
                    else if (char === '④') lvl = 4;
                    if (lvl > 0) talismanSlots.push({ lvl, type: isWeaponSlot ? 'w' : 'a' });
                }
            }
        }

        performSearch(targetSkills, weaponSlots, weaponSkills, talismanData, talismanSlots, isAutoTalisman);
    }

    async function performSearch(target, wSlots, wSkills, tDataFixed, tSlotsFixed, autoTalisman) {
        renderTargetSummary(target);
        statusText.innerHTML = '<span class="loader"></span>初期化中...';
        
        const targetSkillNames = {};
        const targetPoints = {};

        for (const id in target) {
            const skill = SKILL_BY_ID[id];
            if (skill) {
                targetSkillNames[skill.name] = { id: skill.id, target: target[id] };
                let pts = target[id];
                if (skill.mainCategory === 'series') pts = target[id] * 2;
                else if (skill.mainCategory === 'group') pts = 3; 
                targetPoints[id] = pts;
            }
        }

        await new Promise(r => setTimeout(r, 50));
        statusText.innerHTML = '<span class="loader"></span>防具データを整理中...';

        const armorLabels = ['頭','胴','腕','腰','脚','護石'];
        const armorParts = { head: [], chest: [], arms: [], waist: [], legs: [], talisman: [] };
        ARMOR.forEach(a => {
            if (!armorParts[a.p]) return;
            const rel = {};
            if (a.sk) a.sk.forEach(s => { 
                if (targetSkillNames[s.n]) rel[targetSkillNames[s.n].id] = (rel[targetSkillNames[s.n].id] || 0) + s.l; 
            });
            if (a.ss && targetSkillNames[a.ss]) {
                const sid = targetSkillNames[a.ss].id;
                rel[sid] = Math.max(rel[sid] || 0, 1);
            }
            if (a.gs && targetSkillNames[a.gs]) {
                const sid = targetSkillNames[a.gs].id;
                rel[sid] = Math.max(rel[sid] || 0, 1);
            }
            armorParts[a.p].push({ 
                ...a, 
                name: a.n, 
                set: a.s, 
                slots: a.sl || [0,0,0], 
                sl: a.sl || [0,0,0], 
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
                const slotScore = (item.slots || []).reduce((sum, s) => sum + ((s.lvl || s) > 0 ? 1 : 0), 0);
                const slotDetail = (item.slots || []).map(s => s.lvl || s || 0).sort((a,b)=>b-a);
                return { item, sScore, slotScore, slotDetail, def: item.defense || 0 };
            });

            // 1. 上位互換チェック
            const survivors = [];
            evaluated.sort((a, b) => b.sScore - a.sScore || b.slotScore - a.slotScore || b.def - a.def);
            
            for (let i = 0; i < evaluated.length; i++) {
                const a = evaluated[i];
                let isInferior = false;
                for (let j = 0; j < survivors.length; j++) {
                    const b = survivors[j];
                    // 全ての属性においてbがa以上であればaは不要
                    if (b.sScore >= a.sScore && b.slotScore >= a.slotScore && b.def >= a.def) {
                        const skillsOk = tIds.every(id => (b.item.skills[id]||0) >= (a.item.skills[id]||0));
                        const slotsOk = b.slotDetail.every((lvl, idx) => lvl >= (a.slotDetail[idx]||0));
                        if (skillsOk && slotsOk) {
                            isInferior = true;
                            break;
                        }
                    }
                }
                if (!isInferior) survivors.push(a);
            }

            // 2. スキルを一切持たない「穴埋め」防具は、スロット最強の上位3件だけに絞る
            const hasSkill = survivors.filter(s => s.sScore > 0);
            const noSkill = survivors.filter(s => s.sScore === 0);
            noSkill.sort((a, b) => b.slotScore - a.slotScore || b.def - a.def);

            const final = [...hasSkill.map(s => s.item), ...noSkill.slice(0, 5).map(s => s.item)];
            return final;
        };

        statusText.innerHTML = '<span class="loader"></span>護石パターンを生成中...';
        const relevantTalismans = [];
        const tRareVal = tRareSelect.value;
        const tSlotValFilter = tSlotSelect.value;
        const filterS1 = tSkillSelects[0].value;
        const filterS2 = tSkillSelects[1].value;
        const filterS3 = tSkillSelects[2].value;

        TALISMAN_COMBINATIONS.forEach(comb => {
            if (!autoTalisman && tRareVal !== 'any' && comb.rare != tRareVal) return;
            const patternSlots = TALISMAN_SLOTS[`RARE${comb.rare}`] || [];
            patternSlots.forEach(slotStr => {
                if (!autoTalisman && tSlotValFilter !== 'any' && slotStr !== tSlotValFilter) return;
                let tSlots = [];
                const isW = slotStr.startsWith('W');
                const cleaned = slotStr.replace('W', '');
                for(let char of cleaned) {
                    if(char === '①') tSlots.push(1);
                    else if(char === '②') tSlots.push(2);
                    else if(char === '③') tSlots.push(3);
                    else if(char === '④') tSlots.push(4);
                }
                const choices = [comb.s1, comb.s2, comb.s3].filter(g => g !== null);
                const groupOptions = choices.map((gid, idx) => {
                    const filter = [filterS1, filterS2, filterS3][idx];
                    let skills = TALISMAN_GROUPS[gid] || [];
                    if (!autoTalisman && filter !== 'any' && filter !== undefined) {
                        const [fName, fLvl] = filter.split('|');
                        const match = skills.find(s => s.name === fName && s.level == fLvl);
                        return match ? [match] : [];
                    }
                    let relevant = skills.filter(s => { 
                        const found = SKILL_BY_NAME[s.name];
                        const sid = found ? found.id : null;
                        return sid && targetPoints[sid]; 
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
                    combo.forEach(s => {
                        if (s.name !== "None") {
                            const found = SKILL_BY_NAME[s.name];
                            if (found) tSkills[found.id] = (tSkills[found.id] || 0) + s.level;
                        }
                    });
                    relevantTalismans.push({ name: `RARE${comb.rare}護石 (${slotStr})`, skills: tSkills, slots: tSlots.map(lvl=>({lvl, type:isW?'w':'a'})), defense: 0, p: 'talisman' });
                });
            });
        });

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
                    Object.keys(targetPoints).forEach(sid => { if ((p.skills[sid]||0) > (partMax[sid]||0)) partMax[sid] = p.skills[sid]; });
                    // スロットのポテンシャルを「スロット数」として計算 (1つ = 1ポイント)
                    const slotTotal = (p.slots || []).reduce((sum, s) => sum + ((s.lvl || s) > 0 ? 1 : 0), 0);
                    if (slotTotal > partMaxSlots) partMaxSlots = slotTotal;
                });
                Object.keys(targetPoints).forEach(sid => { maxRemainSkills[i][sid] = (partMax[sid]||0) + (i < 5 ? maxRemainSkills[i+1][sid] : 0); });
                maxRemainSlots[i] = partMaxSlots + (i < 5 ? maxRemainSlots[i+1] : 0);
            }

            const decoBySkill = {};
            const canBeDeco = {}; // 装飾品が存在するスキルかどうかのフラグ
            DECORATIONS.forEach(d => {
                d.sk.forEach(s => {
                    const skId = SKILL_NAME_TO_ID[s.n];
                    if (skId && targetPoints[skId]) {
                        if (!decoBySkill[skId]) decoBySkill[skId] = [];
                        // エンジンが期待するプロパティ名にマッピング
                        decoBySkill[skId].push({ ...d, pts: s.l, lvl: d.sl, type: d.t, name: d.n });
                        canBeDeco[skId] = true;
                    }
                });
            });
            for (const sid in decoBySkill) decoBySkill[sid].sort((a, b) => b.pts/b.lvl - a.pts/a.lvl || b.pts - a.pts);

            let resultsCount = 0;
            const stack = [{ part: 0, currentSkills: { ...wSkills }, currentItems: [] }];
            let baseWeaponPotential = wSlots.length;
            
            function solveChunkDFS() {
                try {
                    const startTime = Date.now();
                    while (stack.length > 0) {
                        const node = stack.pop();
                        const pIdx = node.part;

                        if (pIdx === 6) {
                            const [h, c, a, w, l, t] = node.currentItems;
                            const assignment = check(h, c, a, w, l, t, targetPoints, wSlots, wSkills, decoBySkill);
                            if (assignment) {
                                resultsCount++;
                                allResults.push({ h, c, a, w, l, t, assignment });
                            }
                            if (resultsCount >= 2000) { break; }
                        } else {
                            const currentPartItems = parts[pIdx];
                            for (let i = currentPartItems.length - 1; i >= 0; i--) {
                                const item = currentPartItems[i];
                                let possible = true;
                                const itemSlotsVal = (item.slots || []).reduce((sum, s) => sum + ((s.lvl || s) > 0 ? 1 : 0), 0);
                                const remSlotsVal = (pIdx < 5 ? maxRemainSlots[pIdx+1] : 0);
                                const totalPotentialSlotsVal = itemSlotsVal + remSlotsVal + baseWeaponPotential;

                                for (const sid in targetPoints) {
                                    const cur = (node.currentSkills[sid] || 0) + (item.skills[sid] || 0);
                                    const remMax = (pIdx < 5 ? maxRemainSkills[pIdx + 1][sid] : 0);

                                    const fixedW = wSkills[sid] || 0;
                                    const isAutoCat = (SKILL_BY_ID[sid].mainCategory === 'series' && wSkills.auto_ss) || (SKILL_BY_ID[sid].mainCategory === 'group' && wSkills.auto_gs);
                                    const wPot = isAutoCat ? 1 : 0;

                                    const potential = canBeDeco[sid] ? (remMax + totalPotentialSlotsVal + wPot) : (remMax + wPot);
                                    if (cur + fixedW + potential < targetPoints[sid]) { possible = false; break; }
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
                    finish(allResults);
                } catch (e) {
                    console.error("solveChunkDFS Error:", e);
                    statusText.innerHTML = `<span style="color:red">検索中のエラー(DFS): ${e.message}</span>`;
                }
            }

            function check(h, c, a, w, l, t, tPoints, wS, wSkills, deccos) {
                const pts = {};
                for (const sid in tPoints) {
                    pts[sid] = (h.skills[sid]||0) + (c.skills[sid]||0) + (a.skills[sid]||0) + (w.skills[sid]||0) + (l.skills[sid]||0) + (t.skills[sid]||0);
                    // Add fixed weapon skills
                    if (wSkills[sid]) pts[sid] += wSkills[sid];
                }

                const missing = {};
                for (const sid in tPoints) {
                    const diff = tPoints[sid] - (pts[sid]||0);
                    if (diff > 0) missing[sid] = diff;
                }

                let usedAutoSS = null;
                let usedAutoGS = null;

                if (wSkills.auto_ss) {
                    const ssMissing = Object.keys(missing).filter(id => SKILL_BY_ID[id].mainCategory === 'series');
                    if (ssMissing.length === 1 && missing[ssMissing[0]] === 1) {
                        usedAutoSS = ssMissing[0];
                        delete missing[usedAutoSS];
                    } else if (ssMissing.length === 0) {
                        // All SS satisfied
                    } else {
                        return null; // Too many or more than 1pt
                    }
                }

                if (wSkills.auto_gs) {
                    const gsMissing = Object.keys(missing).filter(id => SKILL_BY_ID[id].mainCategory === 'group');
                    if (gsMissing.length === 1 && missing[gsMissing[0]] === 1) {
                        usedAutoGS = gsMissing[0];
                        delete missing[usedAutoGS];
                    } else if (gsMissing.length === 0) {
                        // All GS satisfied
                    } else {
                        return null;
                    }
                }

                const totalNeeded = Object.values(missing).reduce((a, b) => a + b, 0);
                if (totalNeeded === 0) return { decos: [], autoSS: usedAutoSS, autoGS: usedAutoGS };

                const slotObjects = [];
                [h, c, a, w, l].forEach((item, idx) => { item.slots.filter(s => (s.lvl || s) > 0).forEach(s => slotObjects.push({ piece: idx, lvl: s.lvl || s, type: s.type || 'a' })); });
                wS.forEach(s => slotObjects.push({ piece: 'weapon', lvl: s, type: 'w' }));
                t.slots.forEach(s => slotObjects.push({ piece: 'talisman', lvl: s.lvl || s, type: s.type || 'a' }));
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
            let def = (h.d||0) + (c.d||0) + (a.d||0) + (w.d||0) + (l.d||0);
            let res = [0, 0, 0, 0, 0];
            [h, c, a, w, l].forEach(p => { if (p.r) p.r.forEach((v, i) => res[i] += v); });
            const pts = {};
            const addP = (sid, n) => { if (sid) pts[sid] = (pts[sid]||0) + n; };
            [h, c, a, w, l].forEach(item => {
                if (item.sk) item.sk.forEach(s => addP(SKILL_NAME_TO_ID[s.n], s.l));
                if (item.ss) { const sid = SKILL_NAME_TO_ID[item.ss]; if (sid) addP(sid, 1); }
                if (item.gs) { const sid = SKILL_NAME_TO_ID[item.gs]; if (sid) addP(sid, 1); }
            });
            Object.entries(t.skills).forEach(([sid, n]) => addP(sid, n));
            Object.entries(wSk).forEach(([sid, n]) => { if (sid !== 'auto_ss' && sid!=='auto_gs') addP(sid, n); });
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
                    if (eff.resAdd) {
                        const rIds = ['fire_resistance', 'water_resistance', 'thunder_resistance', 'ice_resistance', 'dragon_resistance'];
                        const idx = rIds.indexOf(sid);
                        if (idx !== -1) res[idx] += eff.resAdd;
                    }
                }
            });
            return { def, res };
        }

        function finish(results) {
            progressBar.style.width = '100%';
            const minRes = [0,1,2,3,4].map(i => parseInt(document.getElementById(`min-res-${i}`).value) || 0);
            const sortType = document.getElementById('search-sort-type').value;

            const processed = results.map(r => ({
                ...r,
                stats: calculateFinalStats(r.h, r.c, r.a, r.w, r.l, r.t, r.assignment.decos, wSlots, wSkills, r.assignment.autoSS, r.assignment.autoGS)
            }));

            const filtered = processed.filter(r => {
                for (let i = 0; i < 5; i++) if (r.stats.res[i] < minRes[i]) return false;
                return true;
            });

            const groups = new Map();
            filtered.forEach(r => {
                const key = `${r.h.n}-${r.c.n}-${r.a.n}-${r.w.n}-${r.l.n}`;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(r);
            });

            const uniqueResults = [];
            groups.forEach(vs => { vs.sort((a,b) => (a.t.rare || 5) - (b.t.rare || 5)); uniqueResults.push(vs[0]); });

            if (sortType === 'def') uniqueResults.sort((a, b) => b.stats.def - a.stats.def);
            else if (sortType.startsWith('res')) {
                const ri = parseInt(sortType.replace('res', ''));
                uniqueResults.sort((a, b) => b.stats.res[ri] - a.stats.res[ri]);
            }

            uniqueResults.slice(0, 100).forEach((r, idx) => {
                renderResult(r.h, r.c, r.a, r.w, r.l, r.t, wSlots, wSkills, r.assignment.decos, idx + 1, target, armorLabels, r.assignment.autoSS, r.assignment.autoGS, r.stats);
            });

            resultCountEl.textContent = `${uniqueResults.length} sets`;
            statusText.textContent = `検索完了! ${uniqueResults.length}種類の装備構成が見つかりました。${results.length > uniqueResults.length ? ` (全${results.length}パターンから集約表示)` : ''}`;
        }

        currentSearchTimeout = setTimeout(solveChunkDFS, 0);
        } catch (setupErr) {
            console.error("Setup Error:", setupErr);
            statusText.innerHTML = `<span style="color:red">エラー: ${setupErr.message}</span>`;
        }
    }

    function renderTargetSummary(target) {
        const summary = document.getElementById('target-summary');
        if (summary) {
            const categoryPriority = { 'weapon': 1, 'armor': 2, 'series': 3, 'group': 4 };
            const sorted = Object.entries(target).map(([id, lvl]) => {
                const s = SKILL_BY_ID[id];
                return { id, lvl, name: s ? s.name : id, cat: s ? s.mainCategory : 'armor', idx: s ? s.originalIndex : 999 };
            }).sort((a, b) => {
                const cpA = categoryPriority[a.cat] || 99;
                const cpB = categoryPriority[b.cat] || 99;
                if (cpA !== cpB) return cpA - cpB;
                if (b.lvl !== a.lvl) return b.lvl - a.lvl;
                return a.idx - b.idx;
            });

            summary.innerHTML = sorted.map(s => {
                return `<span class="target-skill-badge">${s.name} Lv${s.lvl}</span>`;
            }).join('');
        }
    }

    function renderResult(h, c, a, w, l, t, wSlots, wSkills, assignment, idx, target, labels, autoSS, autoGS, stats) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const armorItems = [h, c, a, w, l];
        const totalDef = stats.def;
        const totalRes = stats.res;

        const getPieceDecos = (pid) => assignment.filter(d => d.piece === pid).map(d => `<span class="deco-label">${d.deco.name}</span>`).join(' ');
        const formatRes = (r) => r ? `${r[0]} / ${r[1]} / ${r[2]} / ${r[3]} / ${r[4]}` : '0 / 0 / 0 / 0 / 0';
        const getResHtml = (r) => {
            return r.map((v, i) => `<span class="stat-val" style="margin-right:4px;">${v}</span>`).join('');
        };

        const getFullPieceSkills = (item) => {
            let html = '';
            if (item.sk) {
                item.sk.forEach(s => {
                    // シリーズ/グループ点数が[S]/[G]で別途表記される場合はそちらに任せてここでは非表示に
                    if (s.n === item.ss || s.n === item.gs) return;
                    html += `<span class="piece-skill-label">${s.n} Lv${s.l}</span> `;
                });
            }
            if (item.ss) html += `<span class="special-skill-label">[S] ${item.ss}</span> `;
            if (item.gs) html += `<span class="special-skill-label">[G] ${item.gs}</span> `;
            return html;
        };

        const getWeaponSkillsHtml = (ws, aSS, aGS) => {
            let html = '';
            let ss = null, gs = null;
            Object.entries(ws).forEach(([sid, pts]) => {
                if (sid === 'auto_ss' || sid === 'auto_gs') return;
                const s = SKILL_BY_ID[sid];
                if (!s) return;
                if (s.mainCategory === 'series') ss = s.name;
                else if (s.mainCategory === 'group') gs = s.name;
                else html += `<span class="piece-skill-label">${s.name} Lv${pts}</span> `;
            });
            if (aSS) { const s = SKILL_BY_ID[aSS]; if (s) ss = s.name; }
            if (aGS) { const s = SKILL_BY_ID[aGS]; if (s) gs = s.name; }
            if (ss) html += `<span class="special-skill-label">[S] ${ss}</span> `;
            if (gs) html += `<span class="special-skill-label">[G] ${gs}</span> `;
            return html;
        };

        const getFullTalismanSkills = (t) => {
            return Object.entries(t.skills).map(([sid, pts]) => {
                const s = SKILL_BY_ID[sid];
                return `<span class="piece-skill-label">${s ? s.name : sid} +${pts}</span>`;
            }).join(' ');
        };

        const matrix = {};
        const getM = (sid) => matrix[sid] || (matrix[sid] = { weapon: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, talisman: 0, total: 0 });

        // 初期値 (武器)
        const wSkillsCombined = { ...wSkills };
        if (autoSS) wSkillsCombined[autoSS] = (wSkillsCombined[autoSS] || 0) + 1;
        if (autoGS) wSkillsCombined[autoGS] = (wSkillsCombined[autoGS] || 0) + 1;

        Object.entries(wSkillsCombined).forEach(([sid, pts]) => {
            if (sid === 'auto_ss' || sid === 'auto_gs') return;
            getM(sid).weapon += pts;
            getM(sid).total += pts;
        });

        // 武器装飾品
        assignment.filter(a => a.piece === 'weapon').forEach(d => {
            if (!d.deco.sk) return;
            d.deco.sk.forEach(s => {
                const sid = SKILL_NAME_TO_ID[s.n];
                if (sid) { getM(sid).weapon += s.l; getM(sid).total += s.l; }
            });
        });

        // 防具
        armorItems.forEach((item, idx) => {
            if (item.sk) {
                item.sk.forEach(s => {
                    const sid = SKILL_NAME_TO_ID[s.n];
                    if (sid) { getM(sid)[idx] += s.l; getM(sid).total += s.l; }
                });
            }
            if (item.ss) {
                const sid = SKILL_NAME_TO_ID[item.ss];
                if (sid) { 
                    const oldVal = getM(sid)[idx];
                    const ptsToAdd = Math.max(0, 1 - oldVal);
                    getM(sid)[idx] += ptsToAdd; getM(sid).total += ptsToAdd; 
                }
            }
            if (item.gs) {
                const sid = SKILL_NAME_TO_ID[item.gs];
                if (sid) { 
                    const oldVal = getM(sid)[idx];
                    const ptsToAdd = Math.max(0, 1 - oldVal);
                    getM(sid)[idx] += ptsToAdd; getM(sid).total += ptsToAdd; 
                }
            }
            // 防具の装飾品
            assignment.filter(a => a.piece === idx).forEach(d => {
                if (!d.deco.sk) return;
                d.deco.sk.forEach(s => {
                    const sid = SKILL_NAME_TO_ID[s.n];
                    if (sid) { getM(sid)[idx] += s.l; getM(sid).total += s.l; }
                });
            });
        });

        // 護石
        Object.entries(t.skills).forEach(([sid, pts]) => {
            getM(sid).talisman += pts;
            getM(sid).total += pts;
        });
        // 護石装飾品
        assignment.filter(a => a.piece === 'talisman').forEach(d => {
            if (!d.deco.sk) return;
            d.deco.sk.forEach(s => {
                const sid = SKILL_NAME_TO_ID[s.n];
                if (sid) { getM(sid).talisman += s.l; getM(sid).total += s.l; }
            });
        });

        const activatedRows = [];
        for (const sid in matrix) {
            const m = matrix[sid];
            const skill = SKILL_BY_ID[sid];
            if (!skill) continue;

            let actualLvl = 0;
            let lvlText = '';
            let displayName = skill.name;

            if (skill.mainCategory === 'series' || skill.mainCategory === 'group') {
                const required = (skill.mainCategory === 'series' ? 2 : 3);
                actualLvl = Math.floor(m.total / required);
                if (actualLvl > 0) {
                    actualLvl = Math.min(actualLvl, skill.maxLevel || 1);
                    const effect = skill.effects && skill.effects.find(e => e.level === actualLvl);
                    if (effect && effect.name) {
                        displayName = effect.name;
                    } else {
                        lvlText = `Lv${actualLvl}`;
                    }
                }
            } else {
                actualLvl = Math.min(m.total, skill.maxLevel || 99);
                if (actualLvl > 0) lvlText = `Lv${actualLvl}`;
            }

            if (actualLvl > 0) {
                activatedRows.push({
                    id: sid,
                    name: displayName,
                    lvlText: lvlText,
                    lvl: actualLvl,
                    mainCategory: skill.mainCategory || 'armor',
                    originalIndex: skill.originalIndex,
                    m: m
                });
            }
        }

        const categoryPriority = { 'weapon': 1, 'armor': 2, 'series': 3, 'group': 4 };
        activatedRows.sort((a, b) => {
            const catA = categoryPriority[a.mainCategory] || 99;
            const catB = categoryPriority[b.mainCategory] || 99;
            if (catA !== catB) return catA - catB;
            if (b.lvl !== a.lvl) return b.lvl - a.lvl;
            return a.originalIndex - b.originalIndex;
        });

        const renderVal = (v) => v > 0 ? v : '<span class="empty-cell">-</span>';

        const skillSummaryHtml = `
            <table class="skill-table">
                <thead>
                    <tr>
                        <th>発動スキル合計</th>
                        <th>武</th><th>頭</th><th>胴</th><th>腕</th><th>腰</th><th>脚</th><th>石</th>
                        <th>合計</th>
                    </tr>
                </thead>
                <tbody>
                    ${activatedRows.map(r => `
                        <tr>
                            <td>${r.name}</td>
                            <td class="val-cell">${renderVal(r.m.weapon)}</td>
                            <td class="val-cell">${renderVal(r.m[0])}</td>
                            <td class="val-cell">${renderVal(r.m[1])}</td>
                            <td class="val-cell">${renderVal(r.m[2])}</td>
                            <td class="val-cell">${renderVal(r.m[3])}</td>
                            <td class="val-cell">${renderVal(r.m[4])}</td>
                            <td class="val-cell">${renderVal(r.m.talisman)}</td>
                            <td class="total-cell">${r.lvlText || r.lvl}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        card.innerHTML = `
            <div class="result-header">
                <div style="font-family: var(--font-serif); font-weight: bold; color: var(--color-accent);">SET #${idx}</div>
                <div class="defense-info">
                    防御: <span class="stat-val" style="color:#fff; margin-right:12px;">${totalDef}</span>
                    <span style="font-size:0.7rem; color:var(--color-text-muted); margin-right:4px;">耐性:</span>
                    <span class="stat-val" style="font-size:0.85rem;">${getResHtml(totalRes)}</span>
                </div>
            </div>
            <div class="result-body">
                <div class="armor-list">
                    <div class="armor-item">
                        <div class="armor-main">
                            <span class="armor-part">武器</span>
                            <span class="armor-name">武器固有性能</span>
                        </div>
                        <div class="piece-skills">${getWeaponSkillsHtml(wSkills, autoSS, autoGS)}</div>
                        <div class="decoration-list">${wSlots.map(s => `[${s}]`).join(' ')} ${getPieceDecos('weapon')}</div>
                    </div>
                    ${armorItems.map((item, i) => `
                        <div class="armor-item">
                            <div class="armor-main">
                                <span class="armor-part">${labels[i]}</span>
                                <span class="armor-name">${item.n}</span>
                            </div>
                            <div class="armor-stats">
                                <span>防: <span class="stat-val">${item.d}</span></span>
                                <span>耐: <span class="stat-val">${formatRes(item.r)}</span></span>
                                <span>床: <span class="stat-val">${item.sl.map(s => `[${s}]`).filter(s=>s!=="[0]").join('') || '-'}</span></span>
                            </div>
                            <div class="piece-skills">${getFullPieceSkills(item)}</div>
                            <div class="decoration-list">${getPieceDecos(i)}</div>
                        </div>
                    `).join('')}
                    <div class="armor-item" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.8rem;">
                        <div class="armor-main">
                            <span class="armor-part">護石</span>
                            <span class="armor-name">${t.name}</span>
                        </div>
                        <div class="armor-stats">
                            <span>床: <span class="stat-val">${t.slots.map(s => `[${s.lvl}]`).join('')}</span></span>
                        </div>
                        <div class="piece-skills">${getFullTalismanSkills(t)}</div>
                        <div class="decoration-list">${getPieceDecos('talisman')}</div>
                    </div>
                </div>
                <div class="skill-summary">
                    ${skillSummaryHtml}
                </div>
            </div>
        `;
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) resultsContainer.appendChild(card);
    }


    if (btnReSearch) btnReSearch.addEventListener('click', startSearch);
    setTimeout(startSearch, 200);
});

