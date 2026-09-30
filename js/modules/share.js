/**
 * ビルド共有用のURL生成・解析モジュール
 */
export const BuildShare = {
    isValidState(state) {
        const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
        if (!record(state)) return false;
        for (const key of ['currentSkillLevels', 'skills', 'buffStates', 'locks', 'lockSlots', 'weaponSpecificParams', 'bowgunSettings', 'asst_build_data']) {
            if (state[key] != null && !record(state[key])) return false;
        }
        for (const key of ['parts', 'bonuses']) {
            if (state[key] != null && (!Array.isArray(state[key]) || !state[key].every(x => typeof x === 'string'))) return false;
            if (state.locks?.[key] != null && (!Array.isArray(state.locks[key]) || !state.locks[key].every(x => typeof x === 'string'))) return false;
            if (state.lockSlots?.[key] != null && (!Array.isArray(state.lockSlots[key]) || !state.lockSlots[key].every(x => typeof x === 'boolean'))) return false;
        }
        for (const levels of [state.currentSkillLevels, state.skills].filter(Boolean)) {
            if (!Object.values(levels).every(x => Number.isInteger(Number(x)) && Number(x) >= 0 && Number(x) <= 100)) return false;
        }
        const build = state.asst_build_data;
        if (build?.decos != null && (!Array.isArray(build.decos) || !build.decos.every(d => record(d) && typeof d.n === 'string' && (d.p == null || typeof d.p === 'string')))) return false;
        return true;
    },
    /**
     * 現在の状態をエンコードしてURLパラメータを生成
     */
    generateUrl(state, baseUrl = window.location.href) {
        try {
            if (!this.isValidState(state)) throw new Error('Invalid build state');
            const data = JSON.stringify(state);
            // 互換性と短縮のためBase64化（btoaだけだと日本語が壊れるため、UTF-8対応版）
            const encoded = btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                return String.fromCharCode('0x' + p1);
            }));
            const url = new URL(baseUrl);
            // サーバーのリダイレクトで消えないよう、ハッシュ(#)に格納することを推奨
            url.hash = `build=${encoded}`;
            // 互換性のためクエリからも消しておく（任意）
            url.searchParams.delete('build');
            return url.toString();
        } catch (e) {
            console.error('Failed to generate share URL', e);
            return null;
        }
    },

    /**
     * URLパラメータまたはハッシュから状態をデコード
     */
    decodeUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        let encoded = urlParams.get('build');

        // クエリになければハッシュを確認
        if (!encoded && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            encoded = hashParams.get('build');
        }

        if (!encoded) return null;

        try {
            // URLパラメータ経由だと '+' が ' ' (スペース) に置換されることがあるため補正
            const safeEncoded = encoded.replace(/ /g, '+');
            const decoded = decodeURIComponent(Array.prototype.map.call(atob(safeEncoded), (c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const state = JSON.parse(decoded);
            return this.isValidState(state) ? state : null;
        } catch (e) {
            console.warn('Failed to decode build from URL', e);
            return null;
        }
    }
};
