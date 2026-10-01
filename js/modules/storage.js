// Keep unreadable saved data intact. Empty UI fallback never authorizes overwriting it.
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isSavedSets = value => isRecord(value) && Object.values(value).every(isRecord);
export const isFavoriteSkills = value => Array.isArray(value) && value.every(s => typeof s === 'string');
export const isFavoriteTalismans = value => Array.isArray(value) && value.every(t =>
    isRecord(t) && Array.isArray(t.skills) && t.skills.every(s =>
        isRecord(s) && typeof s.name === 'string' && ['number','string'].includes(typeof s.level) &&
        String(s.level).trim() !== '' && Number.isInteger(Number(s.level)) && Number(s.level) >= 0) &&
    (t.slot == null || typeof t.slot === 'string'));

export function createSavedStorage(getStorage = () => localStorage, notify = message => alert(message)) {
    const snapshots=new Map();
    function read(key, fallback, validate) {
        const raw = getStorage().getItem(key);
        if (raw === null) return {value:fallback,raw};
        const value = JSON.parse(raw);
        if (!validate(value)) throw new Error('Invalid saved data');
        return {value:isRecord(value) ? Object.assign(Object.create(null), value) : value,raw};
    }
    return {
        readJSON(key, fallback, validate) {
            try {
                const result=read(key, fallback, validate);
                snapshots.set(key,result.raw);
                return result.value;
            }
            catch (e) { console.warn(`保存データを読み込めません: ${key}`, e); return fallback; }
        },
        writeJSON(key, value, validate) {
            try {
                // Recheck the source at every write, including after a failed read or another tab's write.
                const current=read(key, null, validate);
                if(snapshots.has(key)&&snapshots.get(key)!==current.raw)throw new Error('SavedDataChanged');
                if (!validate(value)) throw new Error('Invalid new data');
                const raw=JSON.stringify(value);
                getStorage().setItem(key, raw);
                snapshots.set(key,raw);
                return true;
            } catch (e) {
                console.warn(`保存データへの書込みを停止しました: ${key}`, e);
                notify(e.message==='SavedDataChanged' ?
                    '保存を停止しました。別タブなどで保存データが更新されています。再読み込みして最新の内容を確認してください。既存データは上書きしていません。' :
                    '保存できませんでした。既存データは上書きしていません。保存データの形式、ブラウザの保存許可・空き容量を確認してください。');
                return false;
            }
        },
        readText(key) {
            try { return getStorage().getItem(key); } catch (e) { return null; }
        },
        writeText(key, value) {
            try { getStorage().setItem(key, value); return true; }
            catch (e) { notify('設定を保存できませんでした。ブラウザの保存許可・空き容量を確認してください。'); return false; }
        }
    };
}
export const savedStorage = createSavedStorage();
