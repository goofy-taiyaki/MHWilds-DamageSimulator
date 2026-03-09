/**
 * ビルド共有用のURL生成・解析モジュール
 */
export const BuildShare = {
    /**
     * 現在の状態をエンコードしてURLパラメータを生成
     */
    generateUrl(state) {
        try {
            const data = JSON.stringify(state);
            // 互換性と短縮のためBase64化（btoaだけだと日本語が壊れるため、UTF-8対応版）
            const encoded = btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                return String.fromCharCode('0x' + p1);
            }));
            const url = new URL(window.location.href);
            url.searchParams.set('build', encoded);
            return url.toString();
        } catch (e) {
            console.error('Failed to generate share URL', e);
            return null;
        }
    },

    /**
     * URLパラメータから状態をデコード
     */
    decodeUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const encoded = urlParams.get('build');
        if (!encoded) return null;

        try {
            const decoded = decodeURIComponent(Array.prototype.map.call(atob(encoded), (c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(decoded);
        } catch (e) {
            console.warn('Failed to decode build from URL', e);
            return null;
        }
    }
};
