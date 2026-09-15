# freee-kintai-daily-diff

freee勤怠の勤務履歴画面に、1日あたりの所定労働時間に対する「日次過不足時間」を自動表示するユーザースクリプトです。

## 概要

freee勤怠の勤務記録一覧（`work_records`）画面には「労働日数」「総勤務時間」「不足時間」などのサマリーが表示されますが、1日あたりの平均的な過不足がひと目でわかりません。

このスクリプトは以下を計算し、「不足時間」の直後に新しい項目として表示します。

```
日次過不足 = 総勤務時間 - (労働日数 × 所定労働時間)
```

- 所定労働時間より多く働いていれば `+` 表示（オレンジ）
- 所定労働時間より少なければ `-` 表示（赤）
- ちょうどであれば黒字で `0時間0分`

画面のDOM変化（`MutationObserver`）とハッシュ変更を監視し、ページ遷移や再描画のたびに自動更新されます。

## インストール

1. [Tampermonkey](https://www.tampermonkey.net/) など、ユーザースクリプトを実行できる拡張機能をブラウザに導入する
2. 以下のリンクを開く（Tampermonkeyがインストール画面を自動表示します）

   https://raw.githubusercontent.com/muto-yasushi-888/freee-kintai-daily-diff/main/freee-kintai-daily-diff.user.js

3. freee勤怠（`https://p.secure.freee.co.jp/*`）の勤務記録一覧画面を開く

スクリプトには `@updateURL` / `@downloadURL` を設定しているため、以降の更新（`@version` を上げてpush）はTampermonkeyが自動で検知し、更新を促してくれます。

## 設定

スクリプト冒頭の定数で1日の所定労働時間を変更できます。

```js
// 1日の所定労働時間（時間単位、小数OK: 例 7.5 = 7時間30分）
const STANDARD_HOURS_PER_DAY = 8;
```

## 免責事項

本スクリプトは非公式のものであり、freee株式会社とは無関係です。freee勤怠の画面構成（DOM構造）の変更により動作しなくなる可能性があります。
