import { WEAPON_TYPES, SKILLS, EXCITATION_DATA, EXCITATION_TYPES, MONSTERS, MOTION_VALUES, ARMOR, DECORATIONS } from './data.js';

document.addEventListener('DOMContentLoaded', () => {

    // Render Excitation
    const exDb = document.getElementById('db-excitation');
    let exHtml = `<table class="db-table"><thead><tr><th>武器種</th>`;
    EXCITATION_TYPES.forEach(t => exHtml += `<th>${t.name}<br><span style="font-size:0.7em; font-weight:normal;">(攻, 会, 属)</span></th>`);
    exHtml += `</tr></thead><tbody>`;
    WEAPON_TYPES.forEach(w => {
        exHtml += `<tr><td><strong>${w.name}</strong></td>`;
        const data = EXCITATION_DATA[w.id];
        if (data) {
            EXCITATION_TYPES.forEach(t => {
                const ex = data[t.id];
                if (ex) {
                    exHtml += `<td>攻: ${ex.attack > 0 ? '+' + ex.attack : ex.attack} <br> 会: ${ex.affinity > 0 ? '+' + ex.affinity : ex.affinity}% <br> 属: ${ex.element > 0 ? '+' + ex.element : ex.element}</td>`;
                } else {
                    exHtml += `<td>-</td>`;
                }
            });
        } else {
            EXCITATION_TYPES.forEach(() => exHtml += `<td>-</td>`);
        }
        exHtml += `</tr>`;
    });
    exHtml += `</tbody></table>`;
    exDb.innerHTML = exHtml;

    // Render Monsters
    const moDb = document.getElementById('db-monsters');
    const navMonstersSublist = document.getElementById('nav-monsters-sublist');
    let moHtml = '';
    let navMoHtml = '';

    for (const [name, data] of Object.entries(MONSTERS)) {
        navMoHtml += `<li style="margin-bottom: 0.1rem;"><a href="#monster-${name}">${name}</a></li>`;

        moHtml += `
            <details id="monster-${name}" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 0.5rem;">
                <summary style="padding: 0.8rem; cursor: pointer; color: var(--color-primary); font-weight: bold; user-select: none;">
                    ${name}
                </summary>
                <div style="padding: 0 0.8rem 0.8rem 0.8rem;">
                    <table class="db-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>部位</th>
                                <th style="text-align:center;"><img src="icon/hit_slash.png" alt="切断" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/hit_strike.png" alt="打撃" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/hit_shell.png" alt="弾" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/element_fire.png" alt="火" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/element_water.png" alt="水" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/element_thunder.png" alt="雷" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/element_ice.png" alt="氷" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                                <th style="text-align:center;"><img src="icon/element_dragon.png" alt="龍" style="width:16px; height:16px; vertical-align:middle; object-fit:contain;"></th>
                            </tr>
                        </thead>
                        <tbody>`;

        data.parts.forEach(p => {
            moHtml += `<tr>
                <td>${p.name}</td>
                <td style="text-align:center;">${p.sever}</td><td style="text-align:center;">${p.blunt}</td><td style="text-align:center;">${p.ammo}</td>
                <td style="text-align:center; color:#ff6b6b">${p.fire}</td><td style="text-align:center; color:#4dabf7">${p.water}</td><td style="text-align:center; color:#ffd43b">${p.thunder}</td><td style="text-align:center; color:#38d9a9">${p.ice}</td><td style="text-align:center; color:#b19cd9">${p.dragon}</td>
            </tr>`;
        });

        moHtml += `
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    }

    moDb.innerHTML = moHtml;
    if (navMonstersSublist) navMonstersSublist.innerHTML = navMoHtml;


    // Render Skills
    const skDb = document.getElementById('db-skills');
    const navSkillsSublist = document.getElementById('nav-skills-sublist');
    let skHtml = '';
    let navSkHtml = '';

    const MAIN_CATEGORY_NAMES = {
        weapon: '武器スキル',
        armor: '防具スキル',
        series: 'シリーズスキル',
        group: 'グループスキル'
    };

    const SUB_CATEGORY_NAMES = {
        attack: '攻撃力強化',
        affinity: '会心率',
        element: '属性・状態異常',
        ammo: '弾・矢強化',
        utility: 'その他'
    };

    const MAIN_CATEGORY_ORDER = ['weapon', 'armor', 'series', 'group'];
    const SUB_CATEGORY_ORDER = ['attack', 'affinity', 'element', 'ammo', 'utility', null];

    MAIN_CATEGORY_ORDER.forEach(catKey => {
        const catSkills = SKILLS.filter(s => s.mainCategory === catKey);
        if (catSkills.length === 0) return;

        const catName = MAIN_CATEGORY_NAMES[catKey];

        // Sidebar Category (Collapsible) - DEFAULT CLOSED
        navSkHtml += `
            <li style="margin-bottom: 0.3rem;">
                <details class="nav-category-details">
                    <summary style="cursor: pointer; padding: 0.35rem 0.5rem; color: var(--color-primary); font-weight: bold; user-select: none; border-radius: 4px; background: rgba(212, 175, 55, 0.05); font-size: 0.85rem;">
                        ${catName}
                    </summary>
                    <ul class="db-nav-list" style="padding-left: 0.5rem; margin-top: 0.2rem;">`;

        // Main Content Category Header
        skHtml += `
            <div id="cat-${catKey}" class="skill-category-group" style="margin-bottom: 2.5rem;">
                <h3 style="color: var(--color-primary); border-bottom: 2px solid rgba(212, 175, 55, 0.3); padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-size: 1.3rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    ${catName}
                </h3>`;

        SUB_CATEGORY_ORDER.forEach(subKey => {
            const subSkills = catSkills.filter(s => s.subCategory === subKey);
            if (subSkills.length === 0) return;

            const subName = SUB_CATEGORY_NAMES[subKey] || 'その他';

            // Sidebar Sub-category (Collapsible) - DEFAULT CLOSED
            navSkHtml += `
                <li style="margin-top: 0.2rem; margin-left: 0.3rem;">
                    <details class="nav-subcategory-details">
                        <summary style="cursor: pointer; padding: 0.2rem 0.4rem; color: var(--color-text-main); font-size: 0.8rem; user-select: none; border-left: 2px solid rgba(212, 175, 55, 0.3); font-weight: 500;">
                            ${subName}
                        </summary>
                        <ul style="list-style: none; padding-left: 0.8rem; margin: 0.1rem 0 0.3rem 0;">`;

            // Main Content Sub-category Header
            skHtml += `
                <div class="skill-subcategory-group" style="margin-bottom: 1.5rem; margin-left: 0.5rem;">
                    <h4 style="color: rgba(255, 255, 255, 0.8); border-left: 3px solid var(--color-primary); padding-left: 0.8rem; margin: 1rem 0 0.8rem 0; font-size: 1rem;">
                        ${subName}
                    </h4>`;

            subSkills.forEach(s => {
                navSkHtml += `<li style="margin-bottom: 0.1rem;"><a href="#skill-${s.id}" style="font-size: 0.75rem; padding: 0.1rem 0.3rem;">${s.name}</a></li>`;

                const WEAPON_NAMES = {
                    'gs': '大剣', 'ls': '太刀', 'sns': '片手剣', 'db': '双剣',
                    'hammer': 'ハンマー', 'hh': '狩猟笛', 'lance': 'ランス', 'gl': 'ガンランス',
                    'sa': 'スラッシュアックス', 'cb': 'チャージアックス', 'ig': '操虫棍',
                    'bow': '弓', 'lbg': 'ライトボウガン', 'hbg': 'ヘビィボウガン'
                };

                const formatEffect = (e) => {
                    if (e.description) return e.description;
                    let parts = [];
                    if (e.attackAdd !== undefined && e.attackAdd !== 0) parts.push(`攻撃力 +${e.attackAdd}`);
                    if (e.attackMult !== undefined && e.attackMult !== 0) parts.push(`物理乗算 x${(1 + e.attackMult).toFixed(2).replace(/\.?0+$/, '')}`);
                    if (e.affinity !== undefined && e.affinity !== 0) parts.push(`会心率 ${e.affinity > 0 ? '+' + e.affinity : e.affinity}%`);
                    if (e.elementAdd !== undefined && e.elementAdd !== 0) parts.push(`属性値 +${e.elementAdd}`);
                    if (e.elementMult !== undefined && e.elementMult !== 0) parts.push(`属性乗算 x${(1 + e.elementMult).toFixed(2).replace(/\.?0+$/, '')}`);
                    if (e.critMultAdd !== undefined && e.critMultAdd !== 0) parts.push(`超会心加算 +${e.critMultAdd}`);
                    if (e.elementCritMult !== undefined && e.elementCritMult !== 0) parts.push(`属性会心倍率 x${(1 + e.elementCritMult).toFixed(2).replace(/\.?0+$/, '')}`);
                    return parts.length > 0 ? parts.join(', ') : '記載なし';
                };

                let effectsText = '';
                if (s.weaponSpecific && s.weaponEffects) {
                    effectsText = `<table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.8rem; margin-top:5px; border:1px solid rgba(255,255,255,0.05);">
                        <thead style="background:rgba(212, 175, 55, 0.1);">
                            <tr><th style="padding:6px 8px; width:120px;">武器種</th><th style="padding:6px 8px;">効果詳細 (各Lv)</th></tr>
                        </thead><tbody>`;
                    for (const [wType, effects] of Object.entries(s.weaponEffects)) {
                        const wName = WEAPON_NAMES[wType] || wType;
                        let wLvs = effects.map(e => `<strong>Lv${e.level}:</strong> ${formatEffect(e)}`).join('<br>');
                        effectsText += `<tr style="border-top:1px solid rgba(255,255,255,0.05);">
                            <td style="padding:6px 8px; vertical-align:top; color:var(--color-primary);">${wName}</td>
                            <td style="padding:6px 8px;">${wLvs}</td>
                        </tr>`;
                    }
                    effectsText += `</tbody></table>`;
                } else if (s.effects) {
                    effectsText = `<table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.8rem; margin-top:5px; border:1px solid rgba(255,255,255,0.05);">
                        <thead style="background:rgba(212, 175, 55, 0.1);">
                            <tr><th style="padding:6px 8px; width:60px;">Lv</th><th style="padding:6px 8px;">効果</th></tr>
                        </thead><tbody>`;
                    s.effects.forEach(e => {
                        effectsText += `<tr style="border-top:1px solid rgba(255,255,255,0.05);">
                            <td style="padding:6px 8px; color:var(--color-primary); font-weight:bold; white-space: nowrap;">Lv${e.level}${e.name ? ' ' + e.name : ''}</td>
                            <td style="padding:6px 8px;">${formatEffect(e)}</td>
                        </tr>`;
                    });
                    effectsText += `</tbody></table>`;
                }

                skHtml += `
                    <details id="skill-${s.id}" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 0.5rem; margin-left: 0.5rem;">
                        <summary style="padding: 0.6rem 0.8rem; cursor: pointer; color: var(--color-primary); font-weight: bold; user-select: none; font-size: 0.9rem;">
                            ${s.name} <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: normal; margin-left: 0.5rem;">(最大Lv${s.maxLevel})</span>
                        </summary>
                        <div style="padding: 0 0.8rem 0.8rem 0.8rem;">
                            ${effectsText}
                        </div>
                    </details>
                `;
            });

            navSkHtml += `</ul></details></li>`;
            skHtml += `</div>`; // end subcategory
        });

        navSkHtml += `</ul></details></li>`;
        skHtml += `</div>`; // end main category
    });

    skDb.innerHTML = skHtml;
    if (navSkillsSublist) navSkillsSublist.innerHTML = navSkHtml;

    // Render Motions
    const mvDb = document.getElementById('db-motions');
    const navSublist = document.getElementById('nav-motions-sublist');
    let mvHtml = '';
    let navHtml = '';

    WEAPON_TYPES.forEach(w => {
        const motions = MOTION_VALUES[w.id];
        if (!motions || motions.length === 0) return;

        navHtml += `<li style="margin-bottom: 0.1rem;"><a href="#motion-${w.id}">${w.name}</a></li>`;

        const hasPartMod = motions.some(m => m.partMod !== undefined && m.partMod !== 1.0);

        mvHtml += `
            <details id="motion-${w.id}" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 0.5rem;">
                <summary style="padding: 0.8rem; cursor: pointer; color: var(--color-primary); font-weight: bold; user-select: none;">
                    ${w.name}
                </summary>
                <div style="padding: 0 0.8rem 0.8rem 0.8rem;">
                    <table class="db-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th style="width: ${hasPartMod ? '40%' : '50%'};">モーション名</th>
                                <th style="width: ${hasPartMod ? '20%' : '25%'};">モーション値 (MV)</th>
                                <th style="width: ${hasPartMod ? '20%' : '25%'};">属性補正</th>
                                ${hasPartMod ? '<th style="width: 20%;">部位補正</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>`;

        motions.forEach(m => {
            const mvDisplay = Array.isArray(m.mv) ? m.mv.join(' + ') : m.mv;
            mvHtml += `<tr>
                <td>${m.name}</td>
                <td><span style="color: white; font-weight: bold;">${mvDisplay}</span></td>
                <td>x${m.elem}</td>
                ${hasPartMod ? `<td>${m.partMod !== undefined ? 'x' + m.partMod : '-'}</td>` : ''}
            </tr>`;
        });

        mvHtml += `
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    });

    // If no motion values exist at all (fallback)
    if (!mvHtml) {
        mvHtml = `<p>モーション値データはまだありません。</p>`;
    }

    if (navSublist) navSublist.innerHTML = navHtml;
    mvDb.innerHTML = mvHtml;

    // Render Armor
    const arDb = document.getElementById('db-armor');
    const navArmorSublist = document.getElementById('nav-armor-sublist');
    let arHtml = '';
    let navArHtml = '';

    const PART_NAME_MAP = {
        'head': '頭', 'chest': '胴', 'arms': '腕', 'waist': '腰', 'legs': '脚'
    };

    const RES_ICONS = [
        'icon/element_fire.png', 'icon/element_water.png', 'icon/element_thunder.png', 'icon/element_ice.png', 'icon/element_dragon.png'
    ];

    // Group ARMOR by series
    const armorBySeries = {};
    if (ARMOR) {
        ARMOR.forEach(a => {
            if (!armorBySeries[a.s]) armorBySeries[a.s] = [];
            armorBySeries[a.s].push(a);
        });
    }

    const seriesNames = Object.keys(armorBySeries).sort();

    // Group series by rarity
    const armorByRarity = { 4: {}, 5: {}, 6: {}, 7: {}, 8: {} };
    seriesNames.forEach(sName => {
        const firstPiece = armorBySeries[sName][0];
        const rarity = firstPiece.ra || 7;
        const key = rarity <= 4 ? 4 : rarity <= 5 ? 5 : rarity <= 6 ? 6 : rarity <= 7 ? 7 : 8;
        if (!armorByRarity[key]) armorByRarity[key] = {};
        armorByRarity[key][sName] = armorBySeries[sName];
    });

    const rarityColors = {
        4: '#888888',
        5: '#aaaaff',
        6: '#88eebb',
        7: '#ffdd66',
        8: '#ff8844'
    };
    const rarityLabels = {
        4: 'レア4以下',
        5: 'レア5',
        6: 'レア6',
        7: 'レア7',
        8: 'レア8'
    };

    let navArRarityHtml = '';

    [4, 5, 6, 7, 8].forEach(rarity => {
        const rarityGroup = armorByRarity[rarity];
        if (!rarityGroup || Object.keys(rarityGroup).length === 0) return;

        const color = rarityColors[rarity];
        const label = rarityLabels[rarity];
        const groupSeriesNames = Object.keys(rarityGroup).sort();

        // Nav: rarity group header with series links inside
        navArRarityHtml += `
            <details class="rarity-nav-group">
                <summary style="color: ${color};">◆ ${label}（${groupSeriesNames.length}種）</summary>
                <ul>
                    ${groupSeriesNames.map(s => `<li><a href="#armor-${s}">${s}</a></li>`).join('')}
                </ul>
            </details>`;

        arHtml += `
            <div style="margin-bottom: 0.5rem; padding: 0.4rem 0.8rem; background: rgba(${rarity === 4 ? '136,136,136' : rarity === 5 ? '170,170,255' : rarity === 6 ? '136,238,187' : rarity === 7 ? '255,221,102' : '255,136,68'},0.08); border-left: 3px solid ${color}; border-radius: 0 4px 4px 0;">
                <span style="font-weight: bold; color: ${color}; font-size: 0.95rem;">◆ ${label}</span>
            </div>`;

        groupSeriesNames.forEach(sName => {
            const pieces = rarityGroup[sName];
            arHtml += `
                <details id="armor-${sName}" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 0.4rem; margin-left: 0.5rem;">
                    <summary style="padding: 0.7rem; cursor: pointer; color: var(--color-primary); font-weight: bold; user-select: none; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 0.7rem; color: ${color}; border: 1px solid ${color}; padding: 0.1rem 0.3rem; border-radius: 3px;">${label}</span>
                        ${sName}
                    </summary>
                    <div style="padding: 0 0.8rem 0.8rem 0.8rem; overflow-x: auto;">
                        <table class="db-table" style="margin-top: 0; min-width: 600px;">
                            <thead>
                                <tr>
                                    <th style="width: 15%;">部位 / 名称</th>
                                    <th style="width: 8%; text-align:center;">防御</th>
                                    <th style="width: 20%; text-align:center;">耐性 (火/水/雷/氷/龍)</th>
                                    <th style="width: 12%; text-align:center;">スロット</th>
                                    <th style="width: 30%;">発動スキル</th>
                                    <th style="width: 15%;">特殊スキル</th>
                                </tr>
                            </thead>
                            <tbody>`;

            pieces.forEach(p => {
                const resHtml = p.r.map((v, i) => `<span style="color:${v > 0 ? '#ffcc00' : (v < 0 ? '#ff4d4d' : 'inherit')}">${v}</span>`).join(' / ');
                const slotsHtml = p.sl.filter(s => s > 0).map(s => `[${s}]`).join(' ') || '-';
                const skillsHtml = p.sk.map(sk => `${sk.n} Lv${sk.l}`).join('<br>');
                let specialSkill = '';
                if (p.ss) specialSkill += `<div style="font-size:0.8em; color:var(--color-primary);">[S] ${p.ss}</div>`;
                if (p.gs) specialSkill += `<div style="font-size:0.8em; color:#32cd32;">[G] ${p.gs}</div>`;

                arHtml += `<tr>
                    <td><strong>${PART_NAME_MAP[p.p] || p.p}</strong><br><span style="font-size:0.85em;">${p.n}</span></td>
                    <td style="text-align:center;">${p.d}</td>
                    <td style="text-align:center; font-size:0.85em;">${resHtml}</td>
                    <td style="text-align:center;">${slotsHtml}</td>
                    <td style="font-size:0.85em; line-height:1.4;">${skillsHtml}</td>
                    <td>${specialSkill || '-'}</td>
                </tr>`;
            });

            arHtml += `
                            </tbody>
                        </table>
                    </div>
                </details>`;
        });

        arHtml += `<div style="margin-bottom: 1.5rem;"></div>`;
    });

    if (arDb) arDb.innerHTML = arHtml;
    if (navArmorSublist) navArmorSublist.innerHTML = navArRarityHtml;

    // Render Decorations
    const decDb = document.getElementById('db-decorations');
    if (decDb && DECORATIONS && SKILLS) {
        // スキル名からサブカテゴリへのマッピングを作成
        const skillToSubCat = {};
        SKILLS.forEach(s => {
            skillToSubCat[s.name] = s.subCategory || s.mainCategory;
        });

        // 表示用のグループ定義
        // 武器装飾品のサブグループ
        const W_GROUPS = [
            { id: 'w_offense', name: '攻撃系', subCats: ['attack', 'weapon'] },
            { id: 'w_affinity', name: '会心系', subCats: ['affinity'] },
            { id: 'w_element', name: '属性・状態異常系', subCats: ['element'] },
            { id: 'w_ranged', name: '弾・弓・ボウガン系', subCats: ['ammo'] },
            { id: 'w_utility', name: '武器補助・その他', subCats: ['utility', 'series', 'group', 'armor'] }
        ];

        // 防具装飾品のサブグループ
        const A_GROUPS = [
            { id: 'a_offense', name: '火力・攻撃系', subCats: ['attack', 'affinity', 'weapon'] },
            { id: 'a_defense', name: '防御・耐性・生存系', subCats: ['utility', 'armor'] },
            { id: 'a_other', name: 'その他・補助系', subCats: ['element', 'ammo', 'series', 'group'] }
        ];

        // データを分類
        const weaponDecs = {};
        const armorDecs = {};

        W_GROUPS.forEach(g => weaponDecs[g.id] = []);
        A_GROUPS.forEach(g => armorDecs[g.id] = []);

        DECORATIONS.forEach(d => {
            // 最初に見つかったスキルのカテゴリを採用
            let subCat = 'other';
            for (const sk of d.sk) {
                if (skillToSubCat[sk.n]) {
                    subCat = skillToSubCat[sk.n];
                    break;
                }
            }

            if (d.t === 'w') {
                const groupId = W_GROUPS.find(g => g.subCats.includes(subCat))?.id || 'w_utility';
                weaponDecs[groupId].push(d);
            } else {
                const groupId = A_GROUPS.find(g => g.subCats.includes(subCat))?.id || 'a_other';
                armorDecs[groupId].push(d);
            }
        });

        const renderTable = (decs) => {
            if (decs.length === 0) return '';
            let html = `
                <table class="db-table" style="min-width: 500px; margin-top: 0;">
                    <thead>
                        <tr>
                            <th style="width: 35%;">名称</th>
                            <th style="width: 15%; text-align:center;">スロ</th>
                            <th style="width: 50%;">発動スキル</th>
                        </tr>
                    </thead>
                    <tbody>`;
            decs.forEach(d => {
                const skillsHtml = d.sk.map(s => `${s.n} Lv${s.l}`).join('<br>');
                html += `
                    <tr>
                        <td><strong>${d.n}</strong></td>
                        <td style="text-align:center;">[${d.sl}]</td>
                        <td style="font-size:0.85em; line-height:1.4;">${skillsHtml}</td>
                    </tr>`;
            });
            html += `</tbody></table>`;
            return html;
        };

        let decHtml = '';

        // 武器装飾品セクション
        decHtml += `
            <div style="background: rgba(212,175,55,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid rgba(212,175,55,0.3);">
                <h3 style="margin-top:0; color:var(--color-accent); border-bottom: 2px solid var(--color-accent); padding-bottom:0.5rem;">
                    <span style="font-size: 1.2rem; vertical-align: middle;">⚔️</span> 武器用装飾品
                </h3>
                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1rem;">武器のスロットに装着可能な装飾品です。主に基礎火力、属性、弾強化などが含まれます。</p>`;

        W_GROUPS.forEach(group => {
            const decs = weaponDecs[group.id];
            if (decs.length === 0) return;
            decHtml += `
                <details class="db-item-details" style="margin-bottom: 0.5rem; border: 1px solid rgba(212,175,55,0.2); border-radius: 4px;">
                    <summary style="padding: 0.6rem; cursor: pointer; background: rgba(212,175,55,0.05); font-weight: bold; color: var(--color-accent);">
                        ${group.name} (${decs.length})
                    </summary>
                    <div style="padding: 0.5rem; background: rgba(0,0,0,0.2); overflow-x: auto;">
                        ${renderTable(decs)}
                    </div>
                </details>`;
        });
        decHtml += `</div>`;

        // 防具装飾品セクション
        decHtml += `
            <div style="background: rgba(55,155,212,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid rgba(55,155,212,0.3);">
                <h3 style="margin-top:0; color:#4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom:0.5rem;">
                    <span style="font-size: 1.2rem; vertical-align: middle;">🛡️</span> 防具用装飾品
                </h3>
                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1rem;">防具のスロットに装着可能な装飾品です。弱点特効、挑戦者などの強力な火力や、防御、耐性、生存スキルが含まれます。</p>`;

        A_GROUPS.forEach(group => {
            const decs = armorDecs[group.id];
            if (decs.length === 0) return;
            decHtml += `
                <details class="db-item-details" style="margin-bottom: 0.5rem; border: 1px solid rgba(55,155,212,0.2); border-radius: 4px;">
                    <summary style="padding: 0.6rem; cursor: pointer; background: rgba(55,155,212,0.05); font-weight: bold; color: #4a90e2;">
                        ${group.name} (${decs.length})
                    </summary>
                    <div style="padding: 0.5rem; background: rgba(0,0,0,0.2); overflow-x: auto;">
                        ${renderTable(decs)}
                    </div>
                </details>`;
        });
        decHtml += `</div>`;

        decDb.innerHTML = decHtml;
    }

});
