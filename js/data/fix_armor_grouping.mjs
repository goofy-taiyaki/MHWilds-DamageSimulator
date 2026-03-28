
import fs from 'fs';

const filePath = 'e:/Users/tai_r/Documents/AI/mhwilds-site/js/data/armor.js';
let raw = fs.readFileSync(filePath, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const ARMOR = JSON.parse(raw.replace('export const ARMOR = ', '').replace(/;\s*$/, '').trim());

// We want to fix the series name (s) for newly added/incorrectly named α/β/γ armors.
const updatedARMOR = ARMOR.map(a => {
    const name = a.n;
    if (name.includes('α') || name.includes('β') || name.includes('γ')) {
        let suffix = '';
        if (name.includes('α')) suffix = 'α';
        else if (name.includes('β')) suffix = 'β';
        else if (name.includes('γ')) suffix = 'γ';

        // Extract base series name
        // Example: "クイーンピアスα" -> "クイーン"
        // Example: "蒼世ノ侍【艶髪】α" -> "蒼世ノ侍"
        // Example: "シュバルカヘルムγ" -> "シュバルカ"
        
        let base = name.split(suffix)[0].trim();
        
        // Remove part suffixes and brackets
        const partSuffixes = ['マスク', 'メイル', 'アーム', 'コイル', 'グリーヴ', 'ヘッド', 'ベスト', 'グラブ', 'ベルト', 'パンツ', 'ヘルム', 'グリーブ', 'グラス', 'アッパー', 'ブーツ', 'ピアス', 'コート', 'ソルレット', 'キュイラス', 'ガントレット', 'フランチャード', 'バーゴネット', 'イヤリング', 'イヤーカフ', 'グキーヴ'];
        
        // Part name logic
        if (base.endsWith('の')) {
            // keep it
        } else {
            partSuffixes.forEach(ps => {
                if (base.endsWith(ps)) {
                    base = base.substring(0, base.length - ps.length).trim();
                }
            });
        }
        
        // Brackets check for "蒼世ノ侍【艶髪】" -> "蒼世ノ侍"
        if (base.includes('【')) {
            base = base.split('【')[0].trim();
        }

        // Specific overrides if needed
        if (base === "ホープ") {} // correct
        if (base === "ボーン") {} // correct
        if (base === "ランゴ") base = "ランゴ"; 
        
        // Special case for "蒼世ノ侍α"
        if (base === "蒼世ノ侍") {
             // correct
        }

        // Reconstruct series name
        const newS = base + suffix;
        
        // Only update if it helps grouping (i.e., we are targeting the ones we messed up)
        // Check if the current s is one of the problematic ones (head-specific name)
        const problematicPrefixes = ['クイーン', 'シュバルカ', 'ホープ', 'レザー', 'ボーン', 'チェーン', 'アロイ', 'ランゴ', 'ピラギル', 'タリオス', 'ブブラチカ', 'ラクノダズ'];
        if (problematicPrefixes.some(p => a.s.startsWith(p)) || a.s === "蒼世ノ侍") {
            a.s = newS;
        }
    }
    return a;
});

fs.writeFileSync(filePath, `export const ARMOR = ${JSON.stringify(updatedARMOR)};\n`, 'utf8');
console.log(`Fixed series grouping for armors.`);

