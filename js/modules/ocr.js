/**
 * ocr.js  -  スキル自動認識モジュール（テキスト貼り付け方式）
 *
 * Web サイト（kiranico / game8 等）からコピーしたスキルテキストを
 * 解析し、一致するスキルを自動選択する。
 */

// ======================================================================
// テキスト解析: スキル名 + Lv を全文正規表現で抽出
// ======================================================================
function parseSkillsFromText(text, skills) {
    const results = {};

    const normalized = text
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/Ｌｖ/g, 'Lv').replace(/ＬＶ/g, 'LV').replace(/ｌｖ/g, 'lv')
        .replace(/[．。]/g, '.')
        .replace(/\u3000/g, ' ')
        .replace(/[|｜]/g, '')
        .replace(/\r/g, '\n');

    const sortedSkills = [...skills]
        .filter(s => s.maxLevel > 0)
        .sort((a, b) => b.name.length - a.name.length);

    for (const skill of sortedSkills) {
        const escName = skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 1. スキル名 + Lv 表記のチェック (例: 攻撃 Lv4)
        const lvPat = new RegExp(
            escName + '[\\s　]*[Ⅰ-Ⅹⅰ-ⅹ]?[\\s　]*[Ll][Vv][.．]?[\\s　]*([1-9][0-9]?)', 'g'
        );
        const m = [...normalized.matchAll(lvPat)];
        if (m.length > 0) {
            const lv = Math.min(parseInt(m[0][1]), skill.maxLevel);
            if (lv > 0 && !results[skill.id]) results[skill.id] = lv;
            continue;
        }

        // 2. 発動スキル名でのチェック (シリーズ/グループスキル用、例: 灼熱化Ⅰ, 根性【果敢】)
        if (skill.effects) {
            // 文字数の長い方からチェックして誤判定を防ぐ
            const sortedEffects = [...skill.effects].sort((a, b) => (b.name ? b.name.length : 0) - (a.name ? a.name.length : 0));
            for (const effect of sortedEffects) {
                if (effect.name && normalized.includes(effect.name)) {
                    if (!results[skill.id]) {
                        results[skill.id] = effect.level;
                        break; 
                    }
                }
            }
            if (results[skill.id]) continue;
        }

        // 3. スキル名単体でのチェック (maxLevel=1 の場合や、Lv 表記がない場合)
        if (normalized.includes(skill.name) && !results[skill.id]) {
            results[skill.id] = 1;
        }
    }
    return results;
}

// ======================================================================
// 確認モーダル
// ======================================================================
function showConfirmModal(matchedSkills, skills, cachedSkillSelects, updateCalculation) {
    document.getElementById('ocr-modal')?.remove();

    const entries = Object.entries(matchedSkills);
    const modal = document.createElement('div');
    modal.id = 'ocr-modal';
    modal.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.8); backdrop-filter:blur(4px);
        display:flex; align-items:center; justify-content:center;
        font-family:'Marcellus','Noto Serif JP',serif;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        background:#1a1a1a; border:1px solid rgba(255,215,0,0.3); border-radius:12px;
        padding:1.5rem; width:min(520px,95vw); max-height:85vh;
        display:flex; flex-direction:column; gap:0.8rem;
        box-shadow:0 8px 40px rgba(0,0,0,0.9); overflow:hidden;
    `;

    // ヘッダー
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
    header.innerHTML = `
        <span style="font-size:1.2rem;">🔍</span>
        <h3 style="color:#ffcc00;font-size:1rem;margin:0;flex:1;">認識結果</h3>
        <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);">${entries.length}件マッチ</span>
    `;

    // スキルリスト
    const skillPanel = document.createElement('div');
    skillPanel.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:0.25rem;max-height:50vh;';

    if (entries.length === 0) {
        skillPanel.innerHTML = `<div style="color:rgba(255,255,255,0.5);text-align:center;padding:1.5rem;line-height:1.8;">
            スキルが検出されませんでした。<br>
            <small style="color:rgba(255,255,255,0.3);">スキル名（弱点特効Lv.4 など）が含まれているか確認してください</small>
        </div>`;
    } else {
        entries.forEach(([id, lv]) => {
            const skill = skills.find(s => s.id === id);
            if (!skill) return;
            const row = document.createElement('label');
            row.style.cssText = `display:flex;align-items:center;gap:0.6rem;
                background:rgba(255,255,255,0.04);padding:0.35rem 0.6rem;
                border-radius:6px;border:1px solid rgba(255,215,0,0.1);cursor:pointer;transition:background 0.15s;`;
            row.innerHTML = `
                <input type="checkbox" data-skill-id="${id}" data-level="${lv}" checked
                    style="accent-color:#ffcc00;width:14px;height:14px;cursor:pointer;flex-shrink:0;">
                <span style="flex:1;font-size:0.85rem;color:#fff;">${skill.name}</span>
                <span style="font-size:0.75rem;background:rgba(255,215,0,0.15);color:#ffcc00;
                    padding:0.1rem 0.5rem;border-radius:4px;border:1px solid rgba(255,215,0,0.3);">Lv ${lv}</span>`;
            row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,215,0,0.08)');
            row.addEventListener('mouseleave', () => row.style.background = 'rgba(255,255,255,0.04)');
            skillPanel.appendChild(row);
        });
    }

    // 注意書き
    const note = document.createElement('div');
    note.style.cssText = 'font-size:0.68rem;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.08);padding-top:0.4rem;';
    note.textContent = '※ チェックを外したスキルは適用されません。既存スキルはリセットされます。';

    // ボタン行
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:0.5rem;';

    const btnApply = document.createElement('button');
    btnApply.textContent = '✅ 選択を適用';
    btnApply.disabled = entries.length === 0;
    btnApply.style.cssText = `
        flex:1;padding:0.5rem;border-radius:6px;font-size:0.85rem;
        background:${entries.length > 0 ? '#32cd32' : '#555'};
        color:${entries.length > 0 ? '#000' : '#888'};
        border:none;cursor:${entries.length > 0 ? 'pointer' : 'not-allowed'};
        font-family:inherit;font-weight:bold;`;
    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'キャンセル';
    btnCancel.style.cssText = `
        padding:0.5rem 1rem;border-radius:6px;font-size:0.85rem;
        background:transparent;color:#aaa;border:1px solid rgba(255,255,255,0.2);
        cursor:pointer;font-family:inherit;`;

    btnApply.addEventListener('click', () => {
        const checked = skillPanel.querySelectorAll('input:checked');
        skills.forEach(s => { const el = cachedSkillSelects[s.id]; if (el) el.value = '0'; });
        checked.forEach(c => { const el = cachedSkillSelects[c.dataset.skillId]; if (el) el.value = c.dataset.level; });
        updateCalculation();
        modal.remove();
        showToast(`${checked.length}件のスキルを適用しました`);
    });
    btnCancel.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    btnRow.append(btnApply, btnCancel);
    box.append(header, skillPanel, note, btnRow);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
        background:rgba(30,30,30,0.95);color:#fff;padding:0.6rem 1.4rem;border-radius:24px;
        font-size:0.85rem;z-index:10000;border:1px solid rgba(255,215,0,0.3);
        box-shadow:0 4px 20px rgba(0,0,0,0.4);font-family:'Marcellus','Noto Serif JP',serif;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ======================================================================
// UI 構築（テキスト貼り付けのみ）
// ======================================================================
function buildOCRUI(onParse) {
    const skillsSection = document.querySelector('.skills-panel');
    if (!skillsSection) return;
    const section = document.createElement('div');
    section.id = 'ocr-section';
    section.style.cssText = `
        margin-bottom:1rem; padding:0.75rem;
        border:1px solid rgba(255,215,0,0.2); border-radius:8px;
        background:rgba(255,215,0,0.03);
    `;
    section.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem;">
            <span>📋</span>
            <span style="font-size:0.8rem;font-weight:bold;color:var(--color-primary);">
                スキルテキスト貼り付け認識
            </span>
        </div>
        <textarea id="ocr-text-input"
            placeholder="サイトからコピーしたスキル情報を貼り付け...&#10;例: 弱点特効Lv.4 挑戦者Lv.5 渾身Lv.3 連撃Lv.5"
            style="width:100%;height:75px;resize:vertical;
                background:rgba(0,0,0,0.4);color:#fff;
                border:1px solid rgba(255,215,0,0.25);border-radius:6px;
                padding:0.5rem;font-size:0.75rem;font-family:inherit;
                box-sizing:border-box;line-height:1.5;"></textarea>
        <button id="ocr-parse-btn" style="
            width:100%;margin-top:0.4rem;padding:0.4rem;border-radius:6px;
            background:#ffcc00;color:#000;font-weight:bold;font-size:0.8rem;
            border:none;cursor:pointer;font-family:inherit;
            transition:opacity 0.2s;">
            解析してスキルを認識
        </button>
    `;

    const title = skillsSection.querySelector('.panel-title');
    if (title) title.insertAdjacentElement('afterend', section);
    else skillsSection.prepend(section);

    const textarea = section.querySelector('#ocr-text-input');
    const btn = section.querySelector('#ocr-parse-btn');

    btn.addEventListener('click', () => {
        const val = textarea.value.trim();
        if (val) onParse(val);
    });

    // Ctrl+Enter でも解析できるように
    textarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onParse(textarea.value.trim());
    });
}

// ======================================================================
// メイン公開関数
// ======================================================================
export function initOCR(skills, cachedSkillSelects, updateCalculation) {
    buildOCRUI(text => {
        const matched = parseSkillsFromText(text, skills);
        showConfirmModal(matched, skills, cachedSkillSelects, updateCalculation);
    });
}
