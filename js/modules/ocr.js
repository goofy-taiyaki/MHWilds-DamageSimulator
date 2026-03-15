/**
 * ocr.js  -  スクリーンショットからスキルを自動認識するモジュール
 * Tesseract.js v5 (UMD/script tag) を動的ロードして使用。
 */

// ---- Tesseract.js を script タグ経由でロード（ESM import回避）----
function loadTesseract() {
    return new Promise((resolve, reject) => {
        if (window.Tesseract) { resolve(window.Tesseract); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = () => {
            if (window.Tesseract) resolve(window.Tesseract);
            else reject(new Error('Tesseract.js はロードされましたが window.Tesseract が見つかりません'));
        };
        script.onerror = () => reject(new Error('Tesseract.js の CDN 読み込みに失敗しました。ネット接続を確認してください。'));
        document.head.appendChild(script);
    });
}

// ---- canvas を使った前処理: 拡大 + 暗背景検出 + 二値化 ----
function preprocessImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
        img.onload = () => {
            // 2倍に拡大（小さいフォントのOCR精度向上）
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width  = img.width  * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 平均輝度で明暗判定
            let total = 0;
            for (let i = 0; i < data.length; i += 4) {
                total += (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
            }
            const avg = total / (data.length / 4);
            const isDark = avg < 120;

            for (let i = 0; i < data.length; i += 4) {
                let gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                if (isDark) gray = 255 - gray;
                const binary = gray > 140 ? 255 : 0;
                data[i] = data[i+1] = data[i+2] = binary;
            }
            ctx.putImageData(imageData, 0, 0);
            URL.revokeObjectURL(url);
            resolve({ dataUrl: canvas.toDataURL('image/png'), isDark, avgBrightness: Math.round(avg) });
        };
        img.src = url;
    });
}

// ---- テキストからスキル名+レベルを抽出 ----
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
        const escapedName = skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const lvPattern = new RegExp(
            escapedName +
            '[\\s　]*' +
            '[Ⅰ-Ⅹⅰ-ⅹ]?' +
            '[\\s　]*' +
            '[Ll][Vv][.．]?[\\s　]*' +
            '([1-9][0-9]?)',
            'g'
        );

        const matchesLv = [...normalized.matchAll(lvPattern)];
        if (matchesLv.length > 0) {
            const level = Math.min(parseInt(matchesLv[0][1]), skill.maxLevel);
            if (level > 0 && !results[skill.id]) {
                results[skill.id] = level;
            }
            continue;
        }

        if (skill.maxLevel === 1 && normalized.includes(skill.name)) {
            if (!results[skill.id]) results[skill.id] = 1;
        }
    }

    return results;
}

// ---- 確認モーダル（生テキスト表示タブ付き）----
function showConfirmModal(matchedSkills, rawText, skills, cachedSkillSelects, updateCalculation) {
    document.getElementById('ocr-modal')?.remove();

    const skillEntries = Object.entries(matchedSkills);
    const modal = document.createElement('div');
    modal.id = 'ocr-modal';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Marcellus','Noto Serif JP',serif;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        background: #1a1a1a; border: 1px solid rgba(255,215,0,0.3);
        border-radius: 12px; padding: 1.5rem; width: min(560px, 95vw);
        max-height: 85vh; display: flex; flex-direction: column; gap: 0.8rem;
        box-shadow: 0 8px 40px rgba(0,0,0,0.9); overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; align-items:center; gap:0.5rem;';
    header.innerHTML = `
        <span style="font-size:1.2rem;">🔍</span>
        <h3 style="color:#ffcc00; font-size:1rem; margin:0; flex:1;">OCR検出結果</h3>
        <span style="font-size:0.75rem; color:rgba(255,255,255,0.4);">${skillEntries.length}件マッチ</span>
    `;

    // タブ
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex; gap:0.3rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.4rem;';
    tabBar.innerHTML = `
        <button id="tab-skills" style="
            padding:0.3rem 0.8rem; border-radius:4px 4px 0 0; font-size:0.8rem; cursor:pointer;
            background:rgba(255,215,0,0.15); color:#ffcc00;
            border:1px solid rgba(255,215,0,0.3); font-family:inherit;">スキル一覧</button>
        <button id="tab-raw" style="
            padding:0.3rem 0.8rem; border-radius:4px 4px 0 0; font-size:0.8rem; cursor:pointer;
            background:transparent; color:rgba(255,255,255,0.4);
            border:1px solid transparent; font-family:inherit;">生テキスト (デバッグ)</button>
    `;

    const skillPanel = document.createElement('div');
    skillPanel.style.cssText = 'overflow-y:auto; display:flex; flex-direction:column; gap:0.25rem; max-height:45vh;';

    if (skillEntries.length === 0) {
        skillPanel.innerHTML = `<div style="color:rgba(255,255,255,0.5); text-align:center; padding:1.5rem; line-height:1.8;">
            スキルが検出されませんでした。<br>
            <small style="color:rgba(255,255,255,0.3);">「生テキスト」タブでOCR結果を確認してください</small>
        </div>`;
    } else {
        skillEntries.forEach(([skillId, level]) => {
            const skill = skills.find(s => s.id === skillId);
            if (!skill) return;
            const row = document.createElement('label');
            row.style.cssText = `
                display:flex; align-items:center; gap:0.6rem;
                background:rgba(255,255,255,0.04); padding:0.35rem 0.6rem;
                border-radius:6px; border:1px solid rgba(255,215,0,0.1);
                cursor:pointer; transition:background 0.15s;
            `;
            row.innerHTML = `
                <input type="checkbox" data-skill-id="${skillId}" data-level="${level}" checked
                    style="accent-color:#ffcc00; width:14px; height:14px; cursor:pointer; flex-shrink:0;">
                <span style="flex:1; font-size:0.85rem; color:#fff;">${skill.name}</span>
                <span style="font-size:0.75rem; background:rgba(255,215,0,0.15);
                    color:#ffcc00; padding:0.1rem 0.5rem; border-radius:4px;
                    border:1px solid rgba(255,215,0,0.3); white-space:nowrap;">Lv ${level}</span>
            `;
            row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,215,0,0.08)');
            row.addEventListener('mouseleave', () => row.style.background = 'rgba(255,255,255,0.04)');
            skillPanel.appendChild(row);
        });
    }

    const rawPanel = document.createElement('div');
    rawPanel.style.cssText = `
        display:none; overflow-y:auto; max-height:45vh;
        background:rgba(0,0,0,0.4); padding:0.6rem; border-radius:6px;
        border:1px solid rgba(255,255,255,0.1); font-size:0.65rem;
        color:rgba(255,255,255,0.7); white-space:pre-wrap; font-family:monospace; line-height:1.5;
    `;
    rawPanel.textContent = rawText || '(テキストなし)';

    const btnTabSkills = tabBar.querySelector('#tab-skills');
    const btnTabRaw    = tabBar.querySelector('#tab-raw');
    btnTabSkills.addEventListener('click', () => {
        skillPanel.style.display = 'flex'; rawPanel.style.display = 'none';
        btnTabSkills.style.cssText += ';background:rgba(255,215,0,0.15);color:#ffcc00;';
        btnTabRaw.style.cssText    += ';background:transparent;color:rgba(255,255,255,0.4);';
    });
    btnTabRaw.addEventListener('click', () => {
        skillPanel.style.display = 'none'; rawPanel.style.display = 'block';
        btnTabRaw.style.cssText    += ';background:rgba(255,255,255,0.07);color:#fff;';
        btnTabSkills.style.cssText += ';background:transparent;color:rgba(255,255,255,0.4);';
    });

    const note = document.createElement('div');
    note.style.cssText = 'font-size:0.68rem; color:rgba(255,255,255,0.3); border-top:1px solid rgba(255,255,255,0.08); padding-top:0.4rem;';
    note.textContent = '※ チェックを外したスキルは適用されません。既存スキルはリセットされます。';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:0.5rem;';

    const btnApply = document.createElement('button');
    btnApply.textContent = '✅ 選択を適用';
    btnApply.disabled = skillEntries.length === 0;
    btnApply.style.cssText = `
        flex:1; padding:0.5rem; border-radius:6px; font-size:0.85rem;
        background:${skillEntries.length > 0 ? '#32cd32' : '#555'};
        color:${skillEntries.length > 0 ? '#000' : '#888'};
        border:none; cursor:${skillEntries.length > 0 ? 'pointer' : 'not-allowed'};
        font-family:inherit; font-weight:bold;
    `;
    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'キャンセル';
    btnCancel.style.cssText = `
        padding:0.5rem 1rem; border-radius:6px; font-size:0.85rem;
        background:transparent; color:#aaa; border:1px solid rgba(255,255,255,0.2);
        cursor:pointer; font-family:inherit;
    `;

    btnApply.addEventListener('click', () => {
        const checked = skillPanel.querySelectorAll('input[type=checkbox]:checked');
        skills.forEach(skill => {
            const sel = cachedSkillSelects[skill.id];
            if (sel) sel.value = '0';
        });
        checked.forEach(chk => {
            const sel = cachedSkillSelects[chk.dataset.skillId];
            if (sel) sel.value = chk.dataset.level;
        });
        updateCalculation();
        modal.remove();
        showToast(`${checked.length}件のスキルを適用しました`);
    });
    btnCancel.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    btnRow.append(btnApply, btnCancel);
    box.append(header, tabBar, skillPanel, rawPanel, note, btnRow);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

// ---- トースト通知 ----
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
        background:rgba(30,30,30,0.95); color:#fff; padding:0.6rem 1.4rem;
        border-radius:24px; font-size:0.85rem; z-index:10000;
        border:1px solid rgba(255,215,0,0.3); box-shadow:0 4px 20px rgba(0,0,0,0.4);
        font-family:'Marcellus','Noto Serif JP',serif;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ---- OCR UIをスキルパネルに挿入 ----
function buildOCRUI(onFileDrop) {
    // .skills-panel 内の hr の直後に差し込む
    const skillsSection = document.querySelector('.skills-panel');
    if (!skillsSection) return;
    const hr = skillsSection.querySelector('hr');

    const section = document.createElement('div');
    section.id = 'ocr-section';
    section.style.cssText = `
        margin-bottom: 1rem; padding: 0.75rem;
        border: 1px solid rgba(255,215,0,0.2); border-radius: 8px;
        background: rgba(255,215,0,0.03);
    `;
    section.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
            <span style="font-size:1rem;">📷</span>
            <span style="font-size:0.8rem; font-weight:bold; color:var(--color-primary);">
                スクショからスキル自動認識
            </span>
        </div>
        <div id="ocr-dropzone" style="
            border:1.5px dashed rgba(255,215,0,0.35); border-radius:6px;
            padding:0.8rem; text-align:center; cursor:pointer;
            transition:background 0.2s, border-color 0.2s;
            color:rgba(255,255,255,0.5); font-size:0.75rem; line-height:1.6;
        ">
            クリック または ここにスクショをドロップ
            <br><span style="font-size:0.65rem; color:rgba(255,255,255,0.3);">
                JPG / PNG / WEBP｜暗背景・明背景 自動判定
            </span>
        </div>
        <input type="file" id="ocr-file-input" accept="image/*" style="display:none;">
        <div id="ocr-progress-text" style="
            display:none; font-size:0.7rem; color:#ffcc00;
            text-align:center; margin-top:0.5rem;
        ">OCR処理中...</div>
    `;

    if (hr) hr.insertAdjacentElement('afterend', section);
    else skillsSection.prepend(section);

    const dropzone = section.querySelector('#ocr-dropzone');
    const fileInput = section.querySelector('#ocr-file-input');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) onFileDrop(fileInput.files[0]);
        fileInput.value = '';
    });
    dropzone.addEventListener('dragover', e => {
        e.preventDefault();
        dropzone.style.background = 'rgba(255,215,0,0.08)';
        dropzone.style.borderColor = 'rgba(255,215,0,0.7)';
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.background = '';
        dropzone.style.borderColor = '';
    });
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.style.background = '';
        dropzone.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) onFileDrop(file);
    });
}

// ---- メイン公開関数 ----
export async function initOCR(skills, cachedSkillSelects, updateCalculation) {
    buildOCRUI(handleFile);

    async function handleFile(file) {
        const progressText = document.getElementById('ocr-progress-text');
        try {
            progressText.style.display = 'block';

            progressText.textContent = '🖼️ 画像を前処理中...';
            const { dataUrl, isDark, avgBrightness } = await preprocessImage(file);
            console.log(`[OCR] 平均輝度=${avgBrightness}, 暗背景=${isDark}`);

            progressText.textContent = '⬇️ OCRエンジンを読み込み中...';
            const Tesseract = await loadTesseract();

            progressText.textContent = '🔍 テキスト認識中... (初回は30秒ほどかかります)';
            const worker = await Tesseract.createWorker('jpn', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const pct = Math.round((m.progress || 0) * 100);
                        progressText.textContent = `🔍 認識中... ${pct}%`;
                    } else if (m.status) {
                        progressText.textContent = `⏳ ${m.status}`;
                    }
                }
            });

            const { data: { text } } = await worker.recognize(dataUrl);
            await worker.terminate();
            console.log('[OCR] 生テキスト:\n', text);

            progressText.textContent = '✅ 照合完了！';
            const matched = parseSkillsFromText(text, skills);
            showConfirmModal(matched, text, skills, cachedSkillSelects, updateCalculation);

        } catch (err) {
            console.error('[OCR] エラー:', err);
            progressText.textContent = `❌ ${err.message}`;
        } finally {
            setTimeout(() => { progressText.style.display = 'none'; }, 5000);
        }
    }
}
