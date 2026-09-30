# 実ゲームからの抽出と名称照合（2026-09-30）

指定されたbeeequeue/remsg-editorは使用していない。既存MHWAプロジェクトの独自PAK/MSGリーダーをscripts/game_formats/にコピーし、Python 3.14標準のZstandard処理を使用した。参照形式・ライセンスは同フォルダのTHIRD_PARTY_NOTICES.mdを参照。

## 抽出元と再実行

読み取り元はD:\SteamLibrary\steamapps\common\MonsterHunterWilds。対象5内部パスについて全32PAKを走査し、ベース・更新から34個のファイルを抽出。ゲーム本体への書き込みは行っていない。

```powershell
python scripts/extract-game-skills.py --game 'D:\SteamLibrary\steamapps\common\MonsterHunterWilds' --output raw_data/game_extract/new-run
```

出力フォルダは未存在の名前を指定する。抽出資産はraw_data/game_extract/以下に保存し、Git除外。manifest.jsonはPAK名、内部パス、オフセット、属性、サイズ、メタデータハッシュ、抽出SHA-256、日本語メッセージのキーとGUIDを持つ。

対象: text/excel_equip/skill.msg.23、skillcommon.msg.23、およびcommon/equip/skilldata.user.3、armordata.user.3、accessorydata.user.3（いずれもnatives/stm/gamedesign/以下）。ファイル名候補リストは既存MHWAのMHWs_STM_Release_63b28bfe.listを参照。未知パスを含めた全資産の列挙ではない。

名称はpatch_014のMSGで照合。patch_015には対象MSGの該当エントリなし。全出現を保全し、ゲーム実行時のロード順を検証済みとはしていない。インストール実体が今回の根拠であり、最新公開版と同一とは断定しない。

## 今回の修正

docs/skill-name-corrections.jsonに8種類の変更前後、MSGキー・GUID・PAK・SHA-256を記録。サイト内部の同じ文字列参照を一緒に揃えた。既存スキルID、効果値、最大レベルは変更していない。

- 体力回復量UP → 体力回復量ＵＰ
- 防御力DOWN耐性 → 防御力ＤＯＷＮ耐性
- 暗器蜘蛛の力 → 暗器蛸の力
- 鎖刃刺激 → 鎖刃刺撃
- 通常弾・連射矢強化 → 通常弾・通常矢強化
- KO術 → ＫＯ術
- 貫通弾・竜の一矢強化 → 貫通弾・竜の矢強化
- 災禍転覆 → 災禍転福

check-project.mjs: 未知スキル参照57件から11件へ減少、警告7件は継続。新しい構文・静的ファイル参照エラーなし。既存audit-baseline.jsonは変更していない。

## 追加解析と未確定事項

MHWAのrsz_fields.decode_fieldsとrszmhwilds_2d1324dc.jsonを用いてpatch_015のskilldata.user.3を解析。444インスタンスの型CRCを検証し、443件のSkillData.cDataを読み出した。データ領域44300バイトを完全消費。MSG GUIDから説明文へ、SkillCommonのキーから数値スキルIDへ照合できる。解析結果はskilldata-decoded.jsonとskill-levels.jsonに保存。これは解析済みデータ値であり、ゲーム内の実ダメージ検証ではない。

残る参照11件: オメガレゾナンス5、採集の達人1、悪臭耐性2、砲撃術3。単純な表記修正と分けて扱う。

- オメガレゾナンスはゲームでは共通名。サイトは攻撃力・会心率の2つに分けており、シリーズ発動と条件分岐を設計し直す必要がある。
- 採集の達人はゲームで発動効果名として存在し、SkillDataでは革細工の柔性の3点発動に紐付く。防具側の直接参照が正しいかarmordataとの照合が必要。
- 悪臭耐性は定義不足。実データではLv1が時間50%減、Lv2が無効。最大レベル2として追加できる根拠は得たが、装備・護石との対応確認は継続。
- 砲撃術という共通スキル名は今回のMSGには見つからず、砲術は存在する。ただし護石側の対象が砲術と同一であるという対応はまだ未確認。
- 毒ダメージ強化は実データのレベル1のみ、効果時間1.2倍。護石のLv3記載は矛盾するが、護石ルールの抽出・照合後に修正する。

ブラウザ操作、旧共有URLの日本語表示名復元、装備との数値ID対応、ダメージ式は今回未検証。既存の編集内容は保全した。
