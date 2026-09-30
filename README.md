# MHWilds Simulator

Antigravityで作成された、ブラウザ上で動くダメージ計算・装備スキル検索ツール。ビルド不要のHTML/CSS/JavaScript（ES Modules）構成です。このフォルダ自体がサイトのルートです。

## 起動

Python 3を用意し、このフォルダで実行します。

```powershell
.\setup.ps1
# 別ポートの場合
.\setup.ps1 -Port 3001
```

http://127.0.0.1:3000/index.html を開きます。終了はCtrl+C。PowerShellの実行ポリシーで止まる場合は、次の直接コマンドを使います。

```powershell
python -m http.server 3000 --bind 127.0.0.1 --directory .
```

ES Modulesを使うため、HTMLをダブルクリックするfile://での起動は避けます。新しいsetup.ps1は外部パッケージの取得やファイアウォール変更を必要としません。

## 現状を確認する

Node.js 22以降（今回の検証環境は24.15.0）で実行します。

```powershell
node scripts/check-project.mjs
node scripts/check-project.mjs --json
```

ブラウザ用JSとHTML内スクリプトの構文、静的ファイル・importの参照、スキルの重複と名称参照を検査します。エラーがあると終了コード1になります。現状は既知のスキル参照エラー57件、警告7件があり、成功扱いにはしていません。ゲーム内数値の正しさや画面操作の検証は別途必要です。依存パッケージのインストールは不要です。

## 開発の入口

- [AGENTS.md](AGENTS.md): Codex向け作業規約。
- [docs/project-status.md](docs/project-status.md): 構成、確認済みの問題、改善順序、手動確認項目。
- [docs/audit-baseline.json](docs/audit-baseline.json): 2026-09-30時点の構造検査結果。
- [skill_addition_guide.md](skill_addition_guide.md): 既存スキル追加手順。実装と照合して使うこと。
- [asst_logic.md](asst_logic.md)、[improvements.md](improvements.md)、[GEMINI.md](GEMINI.md): 以前の仕様・計画・規約。完了記載や数値は現在の実装を保証しません。
- [update_history.md](update_history.md): 変更履歴。

マイセットやお気に入りはブラウザのlocalStorageに保存されます。localhostと127.0.0.1、ポート、ブラウザを変更すると別の保存領域になります。以前使用したURLの保存領域は、新URLに自動移行されません。

## 最新の検証状況（2026-09-30）

実データに基づく修正後、構造検査はオメガの参照5件のみエラー、警告0件。オメガはユーザー指定により変更禁止。詳細は[修正完了記録](docs/skill-verification-complete.md)。初期基準の57件は履歴として保持しています。

## 公開

公開先: https://goofy-taiyaki.github.io/MHWilds-DamageSimulator/
mainへの更新をGitHub Actionsが検査し、6ページとcss/assets/jsのみGitHub Pagesへ配信します。ゲーム抽出資産や調査資料はサイト配信対象外。オメガ5件は指定された名称・装備の組だけ公開検査で許容し、他のエラーや警告は公開を停止します。

公開版のコミットはversion.jsonで確認できます。ローカルの保存データは公開URLへ自動移行されません。
