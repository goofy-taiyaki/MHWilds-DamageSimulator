# オメガ以外のスキル参照修正の完了（2026-09-30）

ユーザー指定により、オメガレゾナンスの攻撃・会心バージョン、名称参照、効果、計算処理は変更しない。未知参照5件もそのまま報告する。検査の例外で隠していない。

## 実データの根拠

今回追加した抽出は40 + 14 + 5 = 59ファイル。前回分を含め93ファイル。raw_data/game_extract/のmanifest.jsonがPAK名、内部パス、抽出SHA-256を保持。ゲーム本体への書き込みなし。

| 対象 | 根拠 |
| --- | --- |
| グループ名、悪臭耐性 | patch_015のskillcommondata.user.3とpatch_014のskillcommon.msg.23をGUIDで照合 |
| タリオスアームα | patch_014のarmordata.user.3、_DataValue 164、名前GUID 80d9229e-4086-47e2-9eb0-a9f56f2168be。スキルID -1648695680、Lv1は革細工の柔性。Lv3で採集の達人が発動 |
| 耐臭珠 | patch_012のaccessorydata.user.3とpatch_014のaccessory.msg.23。スキルID -411441344、Lv1 |
| 悪臭耐性のレベル | patch_015のskilldata.user.3。Lv1時間50%減、Lv2無効 |
| 護石の候補 | patch_012のrandomamuletlotskilltable.user.3。_SkillTypeを共通定義へ照合し、_SkillPt別に_SkillLvを比較 |
| にゃんにゃんぼう | スキルID 30554、SkillDataのLv1、MSG SkillCommon_EXP30554。会心発生時に低確率でアイテム入手 |

USER解析はCRC一致とデータ領域の完全消費を確認したもののみ使用。候補パスをハッシュ検索して見つけた護石テーブルも、その内部の型を検証した。ファイル名の推測だけを根拠にしていない。charm.user.3はS16未対応で解析できなかったが、武器チャーム用で今回の護石候補修正には使用していない。

## 修正内容

- タリオスアームαのgsを「採集の達人」から「革細工の柔性」に修正。3部位発動の効果名を1部位のグループ名として扱っていた誤りを修正。
- 悪臭耐性を防具スキル、最大Lv2として追加。耐臭珠と護石のLv1/Lv2が定義へ結び付く。ダメージへの加算はない。
- にゃんにゃんぼうを最大Lv0からLv1へ修正し、説明文を登録。架空のダメージ補正は追加していない。
- 護石の10グループ全件を実テーブルと照合し、候補名・Lv・所属の違いを修正。変更明細はtalisman-group-corrections.json。
- 回避距離は護石・装備参照を実データの全角ＵＰへ統一。既存のevade_extender（半角名）とskill_sayel1（全角名）の2IDは旧保存互換性のため保持。スキル辞書全体のID統合は今回の範囲外。
- 空効果警告5件はweaponSpecific/weaponEffectsの見落としによる誤検出。checkerを実装構造に合わせ修正。会心撃【属性】、連撃、災禍転福、属性吸収、チャージマスターの効果値は変更しない。

特に毒ダメージ強化Lv3をLv1へ丸める対応は行っていない。該当する護石グループ3の実候補は速射強化Lv1だったため、候補そのものを訂正。グループ2は砲弾装填Lv2と溜打強化Lv1、グループ4は会心撃【属性】Lv2と睡眠属性強化Lv2等を実テーブルと一致させた。

## 検証

```powershell
node scripts/check-project.mjs
node scripts/verify-game-skill-fixes.mjs
```

構造検査: オメガの未知参照5件のみ、警告0件。終了コード1は変更禁止範囲の5件による。初期audit-baseline.jsonは維持。

実データ照合検査: 護石10グループの候補名・Lvがすべて一致、重複なし。装備のグループポイント1/2/3、耐臭珠の参照、悪臭耐性Lv1/Lv2、にゃんにゃんぼうLv1、オメガ2定義のソースブロック完全一致を確認。検査に必要なverified-groups.jsonとomega-before.jsonは今回のローカル抽出先にある。

原始USERを再解析する場合:

```powershell
python scripts/decode-game-user.py --database 'C:\Users\iwast\Documents\ChatGPT\MHWA\data\raw\reference\rszmhwilds_2d1324dc.json' --directory raw_data/game_extract/20260930-random
```

対象範囲の名称参照、候補所属・レベル、欠落定義の修正は完了。ダメージ計算全体の実測、護石の出現確率、保存形式の全面移行、全画面の手動操作検証は今回行っていない。
