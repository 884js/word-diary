---
name: store-config
description: store.config.json の内容を App Store Connect に push するスキル。リリースノートやアプリ説明文などのメタ情報を更新したい時に使う。「メタデータpush」「ストア情報更新」「store-config」などで呼び出し可能。
---

# store.config.json push

`store.config.json` に書かれた App Store メタデータ（`releaseNotes` / `description` / `promoText` / `keywords` など）を App Store Connect に反映するスキル。新規ビルドは作らない。ビルドも作りたい場合は `/testflight` を使う。

## 手順

### 1. 事前チェック

`store.config.json` を読み、以下を確認する:

- `apple.review` セクションが含まれていないこと
- `apple.info.{locale}.screenshots` フィールドが含まれていないこと

どちらかが残っていると `eas metadata:push` で意図せず上書きされる。残っている場合はユーザーに警告し、削除するか先に進めるかを AskUserQuestion で確認する。

### 2. 現状確認

`store.config.json` から以下を抽出して表示する:

- `apple.version`
- `apple.info.ja.releaseNotes`

`app.json` の `expo.version` とも比較し、ズレていたら警告する（push する版数が想定と違う可能性があるため）。

### 3. リリースノートを更新するか確認

AskUserQuestion で 3 択:

| 選択肢 | 動作 |
|--------|------|
| 現状のまま push | 何も編集せず 5 へ進む |
| 自動生成して上書き | 4 に進む |
| 手動で編集してから push | ユーザーから新しいリリースノート文面を受け取り、`store.config.json` を更新して 5 へ |

### 4. 自動生成（選ばれた時のみ）

#### 4-1. コミット範囲

`app.json` の `expo.ios.buildNumber` を最後に変更したコミットを起点にし、それ以降のコミットを対象にする:

```bash
LAST_BUILD_COMMIT=$(git log -n 1 --pretty=format:%H -G'"buildNumber"' -- app.json)
git log --oneline "${LAST_BUILD_COMMIT}..HEAD"
git diff --stat "${LAST_BUILD_COMMIT}..HEAD"
```

検出できなかった場合は直近 20 コミットをフォールバックとする。
`-G` で見つからない場合は `version` 行の変更を `-G'"version"'` でも探し、より新しい方を起点にする。

#### 4-2. 下書き生成

コミットメッセージとファイル差分から、ユーザー視点で箇条書きを作る:

```
新機能
・xxx

改善
・yyy

バグ修正
・zzz
```

ルール:

- 該当のないカテゴリは省略
- 1 項目 30〜50 文字、体言止めまたは動詞止め
- 内部リファクタ・CI・ビルド設定・skill 追加等は含めない

#### 4-3. 確認

下書きを提示し、AskUserQuestion で「採用 / 編集 / 中止」を聞く。採用または編集合意後、`store.config.json` の `apple.info.ja.releaseNotes` を更新する。

### 5. push 実行

`eas metadata:push --profile testflight --non-interactive` を実行する。`run_in_background: true` で起動し、完了を待つ。

### 6. 結果報告

成功時は以下を案内する:

- 反映先: https://appstoreconnect.apple.com/apps/6763487075/appstore （App Store Connect の「App Store」タブ）
- TestFlight 用の「テスト情報」に反映されたかは TestFlight タブで確認: https://appstoreconnect.apple.com/apps/6763487075/testflight/ios

失敗時はエラーメッセージをそのまま表示し、典型的な原因（認証切れ・フィールド不正・既に提出済みのバージョン）を補足する。

## 制約

- すべての EAS コマンドに `--non-interactive` を必ず付ける
- プロファイルは `testflight` を使用する
- `store.config.json` の `version` は `app.json` の `version` と同期している前提（このスキルでは bump しない。ズレていたら警告だけ）
- `releaseNotes` は `apple.info.ja.releaseNotes` 配下を対象にする
- 箇条書きの記号は `・`（中黒）、カテゴリ見出しは該当があるときのみ出力
