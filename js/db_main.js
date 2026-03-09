import { WEAPON_TYPES, SKILLS, EXCITATION_DATA, EXCITATION_TYPES, MONSTERS, MOTION_VALUES } from './data.js';

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

    SKILLS.forEach(s => {
        navSkHtml += `<li style="margin-bottom: 0.1rem;"><a href="#skill-${s.id}">${s.name}</a></li>`;

        const WEAPON_NAMES = {
            'gs': '大剣', 'ls': '太刀', 'sns': '片手剣', 'db': '双剣',
            'hammer': 'ハンマー', 'hh': '狩猟笛', 'lance': 'ランス', 'gl': 'ガンランス',
            'sa': 'スラッシュアックス', 'cb': 'チャージアックス', 'ig': '操虫棍',
            'bow': '弓', 'lbg': 'ライトボウガン', 'hbg': 'ヘビィボウガン'
        };

        const formatEffect = (e) => {
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
                    <td style="padding:6px 8px; color:var(--color-primary); font-weight:bold;">Lv${e.level}</td>
                    <td style="padding:6px 8px;">${formatEffect(e)}</td>
                </tr>`;
            });
            effectsText += `</tbody></table>`;
        }

        skHtml += `
            <details id="skill-${s.id}" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 0.5rem;">
                <summary style="padding: 0.8rem; cursor: pointer; color: var(--color-primary); font-weight: bold; user-select: none;">
                    ${s.name} <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal; margin-left: 0.5rem;">(最大Lv${s.maxLevel})</span>
                </summary>
                <div style="padding: 0 0.8rem 0.8rem 0.8rem;">
                    ${effectsText}
                </div>
            </details>
        `;
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

});
