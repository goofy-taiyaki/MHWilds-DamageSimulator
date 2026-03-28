
import fs from 'fs';

const filePath = 'e:/Users/tai_r/Documents/AI/mhwilds-site/js/data/armor.js';
let raw = fs.readFileSync(filePath, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const ARMOR = JSON.parse(raw.replace('export const ARMOR = ', '').replace(/;\s*$/, '').trim());

const newDataRaw = `
頭	ホープマスクα	26	1	0	1	0	0	2	1	1	精霊の加護Lv2				
胴	ホープメイルα	26	1	0	1	0	0	2	2	1	毒耐性Lv1				
腕	ホープアームα	26	1	0	1	0	0	2	2	1	睡眠耐性Lv1				
腰	ホープコイルα	26	1	0	1	0	0	2	1	1	精霊の加護Lv1	気絶耐性Lv1			
脚	ホープグリーヴα	26	1	0	1	0	0	2	1	1	気絶耐性Lv2				
															
頭	レザーヘッドα	26	2	0	0	0	0	2	1	1	植生学Lv2				
胴	レザーベストα	26	2	0	0	0	0	2	1	1	植生学Lv1	アイテム使用強化Lv1			
腕	レザーグラブα	26	2	0	0	0	0	2	1	1	植生学Lv1	腹減り耐性Lv1			
腰	レザーベルトα	26	2	0	0	0	0	2	2	1	腹減り耐性Lv1				
脚	レザーパンツα	26	2	0	0	0	0	2	1	1	腹減り耐性Lv1	アイテム使用強化Lv1			
															
頭	チェーンヘッドα	26	0	2	0	0	0	2	2	1	地質学Lv1				
胴	チェーンベストα	26	0	2	0	0	0	2	1	1	地質学Lv1	氷耐性Lv1			
腕	チェーングラブα	26	0	2	0	0	0	2	1	1	地質学Lv1	回復速度Lv1			
腰	チェーンベルトα	26	0	2	0	0	0	2	1	1	回復速度Lv1	氷耐性Lv1			
脚	チェーンパンツα	26	0	2	0	0	0	2	2	1	回復速度Lv1				
															
頭	ボーンヘルムα	32	2	0	2	0	2	2	1	1	気絶耐性Lv1	早食いLv1			
胴	ボーンメイルα	32	2	0	2	0	2	2	1	1	ランナーLv1	気絶耐性Lv1			
腕	ボーンアームα	32	2	0	2	0	2	2	1	1	ランナーLv1	早食いLv1			
腰	ボーンコイルα	32	2	0	2	0	2	2	2	1	ランナーLv1				
脚	ボーングリーブα	32	2	0	2	0	2	2	2	1	気絶耐性Lv1				
															
頭	アロイヘルムα	38	-2	1	-2	-2	1	2	2	1	納刀術Lv1				
胴	アロイメイルα	38	-2	1	-2	-2	1	2	1	1	ひるみ軽減Lv2				
腕	アロイアームα	38	-2	1	-2	-2	1	2	2	1	耐震Lv1				
腰	アロイコイルα	38	-2	1	-2	-2	1	2	1	1	耐震Lv1	納刀術Lv1			
脚	アロイグリーブα	38	-2	1	-2	-2	1	2	1	1	納刀術Lv1	ひるみ軽減Lv1			
															
頭	ブブラチカグラスα	32	-4	1	1	-2	4	1	1	1	昆虫標本の達人Lv1	弱点特効Lv1			甲虫の知らせ
頭	ブブラチカグラスβ	32	-4	1	1	-2	4	3	2	1	昆虫標本の達人Lv1				甲虫の知らせ
															
腕	タリオスアームα	32	4	-2	-2	-2	2	1	1	1	飛び込みLv1	連撃Lv1			採集の達人
腕	タリオスアームβ	32	4	-2	-2	-2	2	3	2	1	飛び込みLv1				革細工の滑性
															
脚	ピラギルグリーブα	32	-3	4	-3	1	1	1	1	1	水場・油泥適応Lv1	水耐性Lv2			革細工の柔性
脚	ピラギルグリーブβ	32	-3	4	-3	1	1	3	1	1	水場・油泥適応Lv1				革細工の柔性
															
頭	ランゴヘルムα	32	-2	1	1	1	2	1	1	1	環境利用の知識Lv1	急襲Lv1			甲虫の知らせ
胴	ランゴメイルα	32	-2	1	1	1	2	2	1	1	環境利用の知識Lv1	回避性能Lv1			甲虫の知らせ
腕	ランゴアームα	32	-2	1	1	1	2	1	1	1	麻痺耐性Lv1	急襲Lv1			甲虫の知らせ
腰	ランゴコイルα	32	-2	1	1	1	2	2	1	1	麻痺耐性Lv1	回避性能Lv1			甲虫の知らせ
脚	ランゴグキーヴα	32	-2	1	1	1	2	2	2	1	環境利用の知識Lv1	麻痺耐性Lv1			甲虫の知らせ
															
頭	ランゴヘルムβ	32	-2	1	1	1	2	3	1	1	環境利用の知識Lv1				甲虫の擬態
胴	ランゴメイルβ	32	-2	1	1	1	2	2	2	2	環境利用の知識Lv1				甲虫の擬態
腕	ランゴアームβ	32	-2	1	1	1	2	3	1	1	麻痺耐性Lv1				甲虫の擬態
腰	ランゴコイルβ	32	-2	1	1	1	2	2	2	2	麻痺耐性Lv1				甲虫の擬態
脚	ランゴグリーヴβ	32	-2	1	1	1	2	3	2	1	環境利用の知識Lv1				甲虫の擬態
															
胴	ラクノダズメイルα	32	4	-2	0	-2	0	1	1	1	ひるみ軽減Lv2	破壊王Lv1			鱗張りの技法
胴	ラクノダズメイルβ	32	4	-2	0	-2	0	3	1	1	ひるみ軽減Lv2				鱗重ねの工夫
															
頭	ネラチカアクセサリα	32	-5	0	0	3	3	1	1	1	睡眠耐性Lv2	攻勢Lv1			甲虫の知らせ
頭	ネラチカアクセサリβ	32	-5	0	0	3	3	3	2	1	睡眠耐性Lv2				甲虫の擬態
															
頭	クイーンピアスα	66	4	1	1	1	3	3	1	1	連撃Lv1			黒蝕竜の力	栄光の誉れ
胴	クイーンコートα	66	4	1	1	1	3	0	0	0	連撃Lv1	スタミナ急速回復Lv2	破壊王Lv1	黒蝕竜の力	栄光の誉れ
腕	クイーンアームα	66	4	1	1	1	3	2	0	0	連撃Lv1	回避距離UPLv1	破壊王Lv1	黒蝕竜の力	栄光の誉れ
腰	クイーンコイルα	66	4	1	1	1	3	0	0	0	連撃Lv2	回避距離UPLv2		黒蝕竜の力	栄光の誉れ
脚	クイーンブーツα	66	4	1	1	1	3	3	2	0	スタミナ急速回復Lv1	破壊王Lv1		黒蝕竜の力	栄光の誉れ
															
頭	蒼世ノ侍【艶髪】α	66	2	4	0	0	3	1	1	1	力の解放Lv1	巧撃Lv1	体術Lv2	海竜の渦雷	毛皮の昴揚
胴	蒼世ノ侍【羽織】α	66	2	4	0	0	3	3	0	0	力の解放Lv1	巧撃Lv1	納刀術Lv1	海竜の渦雷	毛皮の昴揚
腕	蒼世ノ侍【袖】α	66	2	4	0	0	3	3	0	0	力の解放Lv1	巧撃Lv1	体術Lv1	海竜の渦雷	毛皮の昴揚
腰	蒼世ノ侍【帯】α	66	2	4	0	0	3	2	1	0	力の解放Lv1	巧撃Lv1	納刀術Lv2	海竜の渦雷	毛皮の昴揚
脚	蒼世ノ侍【履物】α	66	2	4	0	0	3	2	1	0	力の解放Lv1	巧撃Lv1	体術Lv2	海竜の渦雷	毛皮の昴揚
															
頭	シュバルカヘルムγ	68	2	0	-1	0	-3	2	1	0	弱点特効Lv3			鎖刃竜の飢餓	ヌシの魂
胴	シュバルカメイルγ	68	2	0	-1	0	-3	3	2	0	属性変換Lv3	属性やられ耐性Lv1		鎖刃竜の飢餓	ヌシの魂
腕	シュバルカアームγ	68	2	0	-1	0	-3	2	1	0	鎖刃刺激Lv2	弱点特効Lv2		鎖刃竜の飢餓	ヌシの魂
腰	シュバルカコイルγ	68	2	0	-1	0	-3	2	1	0	属性吸収Lv3	鎖刃刺激Lv1		鎖刃竜の飢餓	ヌシの魂
脚	シュバルカグリーヴγ	68	2	0	-1	0	-3	2	1	0	鎖刃刺激Lv2	属性やられ耐性Lv2		鎖刃竜の飢餓	ヌシの魂
`;

const lines = newDataRaw.trim().split('\n').filter(l => l.trim() !== '');

const pMap = {
    '頭': 'head',
    '胴': 'chest',
    '腕': 'arms',
    '腰': 'waist',
    '脚': 'legs'
};

function parseSkill(s) {
    if (!s || s.trim() === '') return null;
    const match = s.match(/(.*?)\s*Lv(\d+)/);
    if (match) {
        return { n: match[1].trim(), l: parseInt(match[2]) };
    }
    return null;
}

const addedSeries = new Set();
const addedPieces = new Set();

const newArmors = lines.map(line => {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length < 13) return null;

    const partJp = cols[0];
    const name = cols[1];
    const defense = parseInt(cols[2]);
    const res = cols.slice(3, 8).map(v => parseInt(v.replace('-', '-')));
    const slots = cols.slice(8, 11).map(v => parseInt(v) || 0);
    const sk1 = parseSkill(cols[11]);
    const sk2 = parseSkill(cols[12]);
    const sk3 = parseSkill(cols[13]);
    const ss = cols[14] || "";
    const gs = cols[15] || "";

    const skills = [sk1, sk2, sk3].filter(s => s !== null);

    // series name is name without alpha/beta/gamma and without the head/waist etc suffix if possible
    // actually user's data has series in the name usually.
    // I'll try to extract series name.
    let series = name;
    if (name.includes('α')) series = name.split('α')[0].trim();
    else if (name.includes('β')) series = name.split('β')[0].trim();
    else if (name.includes('γ')) series = name.split('γ')[0].trim();
    
    // special cases for names like 蒼世ノ侍【艶髪】α
    if (series.includes('【')) series = series.split('【')[0].trim();

    const piece = {
        s: series,
        p: pMap[partJp] || "head",
        n: name,
        d: defense,
        r: res,
        sl: slots,
        sk: skills,
        ss: ss,
        gs: gs
    };

    // Determine Rarity
    // Default logic:
    // If name contains α, β, γ:
    //   If def <= 38 -> Rare 5
    //   If def <= 52 -> Rare 6
    //   If def <= 64 -> Rare 7
    //   Else -> Rare 8
    // User special instruction: Queen, Sosei, Shuvalka are Rare 8.
    if (series === "クイーン" || series === "蒼世ノ侍" || series === "シュバルカ") {
        piece.ra = 8;
    } else {
        if (defense <= 38) piece.ra = 5;
        else if (defense <= 52) piece.ra = 6;
        else if (defense <= 64) piece.ra = 7;
        else piece.ra = 8;
    }

    return piece;
}).filter(p => p !== null);

// Check for duplicates
const armorNames = new Set(ARMOR.map(a => a.n));
const filteredNew = newArmors.filter(p => {
    if (armorNames.has(p.n)) {
        console.log(`Skipping duplicate: ${p.n}`);
        return false;
    }
    return true;
});

const updatedARMOR = ARMOR.concat(filteredNew);

fs.writeFileSync(filePath, `export const ARMOR = ${JSON.stringify(updatedARMOR)};\n`, 'utf8');
console.log(`Added ${filteredNew.length} new pieces.`);

