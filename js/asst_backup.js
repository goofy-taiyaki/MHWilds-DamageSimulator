import { ARMOR } from './data/armor.js';
import { DECORATIONS } from './data/decorations.js';
import { SKILLS } from './data/skills.js';
import { TALISMAN_GROUPS, TALISMAN_COMBINATIONS, TALISMAN_SLOTS } from './data/talisman.js';

document.addEventListener('DOMContentLoaded', () => {
    const searchParams = new URLSearchParams(window.location.search);
    const targetSkills = {};
    
    searchParams.forEach((value, key) => {
        const lvl = parseInt(value, 10);
        if (isNaN(lvl) || lvl <= 0) return;
        const skill = SKILLS.find(s => s.id === key);
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
            } catch (e) {}
        }
    }

    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const resultCountEl = document.getElementById('result-count');
    const resultsContainer = document.getElementById('results-container');
    const emptyMessage = document.getElementById('empty-message');
    const btnReSearch = document.getElementById('btn-re-search');
    const weaponSsSelect = document.getElementById('weapon-ss');
    const weaponGsSelect = document.getElementById('weapon-gs');

    // Talisman UI Setup
    const tRareSelect = document.getElementById('talisman-rare');
    const tSlotSelect = document.getElementById('talisman-slot-select');
    const tSkillSelects = [
        document.getElementById('talisman-skill-1'),
        document.getElementById('talisman-skill-2'),
        document.getElementById('talisman-skill-3')
    ];

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
    if (weaponSsSelect && weaponGsSelect) {
        weaponSsSelect.innerHTML = '<option value="">武器固有：シリーズスキル</option>';
        weaponGsSelect.innerHTML = '<option value="">武器固有：グループスキル</option>';
        SKILLS.filter(s => s.mainCategory === 'series').forEach(s => { const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.name; weaponSsSelect.appendChild(opt); });
        SKILLS.filter(s => s.mainCategory === 'group').forEach(s => { const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.name; weaponGsSelect.appendChild(opt); });
    }

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
        if (weaponSsSelect && weaponSsSelect.value) weaponSkills[weaponSsSelect.value] = 1;
        if (weaponGsSelect && weaponGsSelect.value) weaponSkills[weaponGsSelect.value] = 1;

        const talismanData = {};
        tSkillSelects.forEach(s => {
            if (s && s.value !== 'any') {
                const [name, lvl] = s.value.split('|');
                const skill = SKILLS.find(sk => sk.name === name);
                if (skill) talismanData[skill.id] = parseInt(lvl, 10);
            }
        });

        const tSlotVal = (tSlotSelect && tSlotSelect.value) || 'any';
        let talismanSlots = [];
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

        performSearch(targetSkills, weaponSlots, weaponSkills, talismanData, talismanSlots);
    }

    async function performSearch(target, wSlots, wSkills, tData, tSlots) {
        renderTargetSummary(target);
        statusText.innerHTML = '<span class="loader"></span>初期化中...';
        
        const targetSkillNames = {};
        for (const id in target) {
            const skill = SKILLS.find(s => s.id === id);
            if (skill) targetSkillNames[skill.name] = { id, target: target[id] };
        }

        // Delay to allow UI update
        await new Promise(r => setTimeout(r, 50));
        statusText.innerHTML = '<span class="loader"></span>防具データを整理中...';

        const armorLabels = ['頭','胴','腕','腰','脚'];
        const armorParts = { head: [], chest: [], arms: [], waist: [], legs: [] };
        ARMOR.forEach(a => {
            if (!armorParts[a.p]) return;
            const rel = {};
            if (a.sk) a.sk.forEach(s => { if (targetSkillNames[s.n]) rel[targetSkillNames[s.n].id] = (rel[targetSkillNames[s.n].id] || 0) + s.l; });
            if (a.ss && targetSkillNames[a.ss]) rel[targetSkillNames[a.ss].id] = (rel[targetSkillNames[a.ss].id] || 0) + 1;
            if (a.gs && targetSkillNames[a.gs]) rel[targetSkillNames[a.gs].id] = (rel[targetSkillNames[a.gs].id] || 0) + 1;
            armorParts[a.p].push({ name: a.n, set: a.s, slots: a.sl || [0,0,0], skills: rel, defense: a.d });
        });

        const prune = (list, partName) => {
            console.log(`Pruning ${partName}, items: ${list.length}`);
            const pruned = [];
            for (let i = 0; i < list.length; i++) {
                let inferior = false;
                for (let j = 0; j < list.length; j++) {
                    if (i === j) continue;
                    const a = list[i], b = list[j];
                    let bBetterOrEqual = true;
                    for (const sid in target) if ((b.skills[sid] || 0) < (a.skills[sid] || 0)) { bBetterOrEqual = false; break; }
                    if (!bBetterOrEqual) continue;
                    const as = [...a.slots].sort((x, y) => y - x);
                    const bs = [...b.slots].sort((x, y) => y - x);
                    for (let k = 0; k < 3; k++) if ((bs[k]||0) < (as[k]||0)) { bBetterOrEqual = false; break; }
                    if (!bBetterOrEqual) continue;
                    let strictlyBetter = false;
                    for (const sid in target) if ((b.skills[sid] || 0) > (a.skills[sid] || 0)) { strictlyBetter = true; break; }
                    for (let k = 0; k < 3; k++) if ((bs[k]||0) > (as[k]||0)) { strictlyBetter = true; break; }
                    if (strictlyBetter || i > j) { inferior = true; break; }
                }
                if (!inferior) pruned.push(list[i]);
            }
            return pruned;
        };

        statusText.innerHTML = '<span class="loader"></span>防具を絞り込み中...';
        await new Promise(r => setTimeout(r, 50));
        const headList = prune(armorParts.head, 'head');
        const chestList = prune(armorParts.chest, 'chest');
        const armsList = prune(armorParts.arms, 'arms');
        const waistList = prune(armorParts.waist, 'waist');
        const legsList = prune(armorParts.legs, 'legs');

        const decoBySkill = {};
        DECORATIONS.forEach(d => {
            d.sk.forEach(s => {
                if (targetSkillNames[s.n]) {
                    const sid = targetSkillNames[s.n].id;
                    if (!decoBySkill[sid]) decoBySkill[sid] = [];
                    decoBySkill[sid].push({ id: d.id, name: d.n, lvl: d.sl, pts: s.l, type: d.t });
                }
            });
        });
        for (const sid in decoBySkill) decoBySkill[sid].sort((a, b) => b.pts/b.lvl - a.pts/a.lvl || b.pts - a.pts);

        const results = [];
        let checked = 0;
        const total = headList.length * chestList.length * armsList.length * waistList.length * legsList.length;

        function solveChunk() {
            const startTime = Date.now();
            while (checked < total) {
                let idx = checked;
                const lIdx = idx % legsList.length; idx = Math.floor(idx / legsList.length);
                const wIdx = idx % waistList.length; idx = Math.floor(idx / waistList.length);
                const aIdx = idx % armsList.length; idx = Math.floor(idx / armsList.length);
                const cIdx = idx % chestList.length; idx = Math.floor(idx / chestList.length);
                const hIdx = idx;

                const h = headList[hIdx], c = chestList[cIdx], a = armsList[aIdx], w = waistList[wIdx], l = legsList[lIdx];
                const assignment = check(h, c, a, w, l, target, wSlots, wSkills, tData, tSlots, decoBySkill);
                if (assignment) {
                    results.push([h, c, a, w, l, assignment]);
                    renderResult(h, c, a, w, l, wSlots, wSkills, tData, tSlots, assignment, results.length, target, armorLabels);
                    resultCountEl.textContent = `${results.length} sets`;
                    if (results.length >= 50) { finish(results.length); return; }
                }
                checked++;
                if (checked % 10000 === 0 && Date.now() - startTime > 40) {
                    progressBar.style.width = `${(checked / total) * 100}%`;
                    statusText.innerHTML = `<span class="loader"></span>検索中... (${Math.floor((checked / total) * 100)}%)`;
                    currentSearchTimeout = setTimeout(solveChunk, 0);
                    return;
                }
            }
            finish(results.length);
        }

        function check(h, c, a, w, l, target, wS, wSkills, tD, tS, deccos) {
            const pts = {};
            for (const sid in target) {
                pts[sid] = (h.skills[sid]||0) + (c.skills[sid]||0) + (a.skills[sid]||0) + (w.skills[sid]||0) + (l.skills[sid]||0) + (tD[sid]||0) + (wSkills[sid]||0);
            }
            const missing = {};
            let totalNeeded = 0;
            for (const sid in target) {
                const diff = target[sid] - (pts[sid]||0);
                if (diff > 0) { missing[sid] = diff; totalNeeded += diff; }
            }
            if (totalNeeded === 0) return { decos: [] };

            const slotObjects = [];
            [h, c, a, w, l].forEach((item, idx) => { item.slots.filter(s => s > 0).forEach(s => slotObjects.push({ piece: idx, lvl: s, type: 'a' })); });
            wS.forEach(s => slotObjects.push({ piece: 'weapon', lvl: s, type: 'w' }));
            tS.forEach(s => slotObjects.push({ piece: 'talisman', lvl: s.lvl, type: s.type }));
            slotObjects.sort((x, y) => x.lvl - y.lvl);

            const decosUsed = [];
            if (canFillWithTracking(missing, slotObjects, deccos, decosUsed)) return { decos: decosUsed };
            return null;
        }

        function canFillWithTracking(missing, slots, deccos, decosUsed) {
            const missingIds = Object.keys(missing);
            if (missingIds.length === 0) return true;
            const skillId = missingIds[0];
            const pts = missing[skillId];
            const usable = deccos[skillId] || [];
            if (usable.length === 0) return false;
            return branchFill(skillId, pts, slots, 0);

            function branchFill(id, nPts, curSlots, dIdx) {
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
            }
        }

        function finish(count) {
            progressBar.style.width = '100%';
            statusText.textContent = `検索完了! ${count}件見つかりました。`;
            if (count === 0) emptyMessage.style.display = 'block';
        }

        currentSearchTimeout = setTimeout(solveChunk, 0);
    }

    function renderTargetSummary(target) {
        const summary = document.getElementById('target-summary');
        if (summary) {
            summary.innerHTML = Object.entries(target).map(([id, lvl]) => {
                const s = SKILLS.find(sk => sk.id === id);
                return `<span style="background: rgba(51, 153, 255, 0.15); border: 1px solid rgba(51, 153, 255, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: #fff; margin-right: 0.5rem; display: inline-block; margin-bottom: 0.3rem;">${s ? s.name : id} Lv${lvl}</span>`;
            }).join('');
        }
    }

    function renderResult(h, c, a, w, l, wSlots, wSkills, tData, tSlots, assignment, idx, target, labels) {
        const card = document.createElement('div');
        card.className = 'result-card';
        const totalDef = (h.defense || 0) + (c.defense || 0) + (a.defense || 0) + (w.defense || 0) + (l.defense || 0);
        const getPieceDecos = (pid) => assignment.decos.filter(d => d.piece === pid).map(d => `<span class="deco-label">${d.deco.name}</span>`).join(' ');
        const armorItems = [h, c, a, w, l];

        card.innerHTML = `
            <div class="result-header">
                <div style="font-family: var(--font-serif); font-weight: bold; color: var(--color-accent); font-variant-numeric: tabular-nums;">SET #${idx}</div>
                <div class="defense-info">防御力: ${totalDef}</div>
            </div>
            <div class="result-body">
                <div class="armor-list">
                    <div class="armor-item"><span class="armor-part">武器</span><span class="armor-name">選択中の武器</span></div>
                    <div class="decoration-list">${wSlots.map(s => `[${s}]`).join(' ')} ${getPieceDecos('weapon')}</div>
                    ${armorItems.map((item, i) => `
                        <div class="armor-item"><span class="armor-part">${labels[i]}</span><span class="armor-name">${item.name}</span></div>
                        <div class="decoration-list">${item.slots.filter(s => s > 0).map(s => `[${s}]`).join(' ')} ${getPieceDecos(i)}</div>
                    `).join('')}
                    <div class="armor-item" style="margin-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
                        <span class="armor-part">護石</span>
                        <span class="armor-name">${Object.entries(tData).map(([id, lvl]) => {const s=SKILLS.find(sk=>sk.id===id); return (s?s.name:id)+' Lv'+lvl;}).join(', ') || 'なし'}</span>
                    </div>
                    <div class="decoration-list">${tSlots.map(s => `[${s.lvl}]`).join(' ')} ${getPieceDecos('talisman')}</div>
                </div>
                <div class="skill-summary">
                    <div style="font-size: 0.75rem; color: var(--color-primary); margin-bottom: 0.5rem;">発動スキル一覧</div>
                    ${Object.entries(target).map(([id, lvl]) => {
                        const s = SKILLS.find(sk => sk.id === id);
                        return `<div class="skill-item"><span class="skill-name">${s ? s.name : id}</span><span class="skill-level" style="font-variant-numeric: tabular-nums;">Lv${lvl}</span></div>`;
                    }).join('')}
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    if (btnReSearch) btnReSearch.addEventListener('click', startSearch);
    setTimeout(startSearch, 200);
});
