---
name: testflight
description: |
  Build iOS app with EAS Build and distribute to TestFlight using the testflight profile in eas.json.
  バージョン bump とリリースノートの下書き生成までを担当する。`store.config.json` を App Store Connect に push したい場合は別スキル `/store-config` を使う。
  Use when: (1) /testflight command (2) user says「TestFlightに出して」「TF配信」「テストフライト」「iOS配信」「ベータ配信」or similar phrases about TestFlight deployment
---

# TestFlight デプロイ

## 手順

### 1. 事前チェック

`npm run typecheck` と `npm run lint` を順番に実行する。エラーがあれば報告して中断する。

### 2. バージョン確認

`app.json` の現在の `version` を読み取り、AskUserQuestion でバージョンを上げるか確認する:

| 選択肢 | 動作 |
|--------|------|
| 現在のまま（{現在のバージョン}） | 何もしない |
| パッチ（例: 0.1.0 → 0.1.1） | app.json + store.config.json の version を更新 |
| マイナー（例: 0.1.0 → 0.2.0） | app.json + store.config.json の version を更新 |
| メジャー（例: 0.1.0 → 1.0.0） | app.json + store.config.json の version を更新 |

**バージョンを bump した場合は `app.json` と `store.config.json` の両方を必ず同じ値に揃える**（片方だけ更新しない）。

現在のままが選ばれた場合は 3 をスキップして 4 に進む。

### 3. リリースノート生成（バージョン bump 時のみ）

前回のバージョンから今回までの差分をもとに、`store.config.json` の `releaseNotes` を生成する。

#### 3-1. コミット範囲を特定する

`app.json` の `version` フィールドを最後に変更したコミットを検出し、それ以降のコミットを取得する:

```bash
# app.json の version 行を変更した直近のコミット SHA を取得
LAST_VERSION_COMMIT=$(git log -n 1 --pretty=format:%H -S'"version"' -- app.json)
# そのコミット以降の変更を取得
git log --oneline "${LAST_VERSION_COMMIT}..HEAD"
git diff --stat "${LAST_VERSION_COMMIT}..HEAD"
```

検出できなかった場合（初回など）は直近 20 コミットをフォールバックとして使う。

#### 3-2. 下書きを生成する

コミットメッセージとファイル差分を読んで、**ユーザー視点** で箇条書きにまとめる。フォーマットは固定:

```
新機能
・xxx
・yyy

改善
・aaa
・bbb

バグ修正
・ccc
```

ルール:

- カテゴリはその回に該当する項目があるものだけ出す（全部空のカテゴリは省略）
- `新機能` → 新しく追加された画面/機能/ウィジェット等
- `改善` → 既存機能の拡張・UI/UX 調整・パフォーマンス改善
- `バグ修正` → バグや不具合を直したもの
- ユーザーに見えない内部リファクタ・CI・ビルド設定などは含めない
- 1 項目は 30〜50 文字程度に留める
- ですます調は避け、体言止めまたは動詞止めで統一

#### 3-3. ユーザー確認

生成した下書きを提示し、AskUserQuestion で 3 択:

| 選択肢 | 動作 |
|--------|------|
| このまま採用 | `store.config.json` の `releaseNotes` をそのまま更新 |
| 編集したい | ユーザーに希望を聞いて差分編集。合意したら更新 |
| スキップ | `releaseNotes` は現状維持（version だけ同期済み） |

### 4. ビルド方法を選択させる

AskUserQuestion で選択肢を提示する:

| 選択肢 | コマンド |
|--------|---------|
| ビルド＆自動提出（推奨） | `eas build --profile testflight --platform ios --auto-submit --non-interactive` |
| ビルドのみ | `eas build --profile testflight --platform ios --non-interactive` |

### 5. ビルドを実行する

選択されたコマンドを `run_in_background: true` でバックグラウンド実行する。

実行後、TaskOutput（`block: false`）で出力を数回ポーリングし、ビルドURL（`https://expo.dev/...builds/...`）が出力に含まれるまで待つ。最大5回程度、各5秒間隔でチェックする。

### 6. 結果報告

ビルドURLを抽出して表示し、以下を案内する:

- **ビルド＆自動提出の場合**: ビルドURLを表示し、「EAS が自動で TestFlight に提出します。App Store Connect の TestFlight タブで配信状況を確認してください」と案内
- **ビルドのみの場合**: ビルドURLを表示し、「ビルド完了後に以下のコマンドで TestFlight に提出できます」と `eas submit --profile testflight --platform ios --latest --non-interactive` を案内

ビルド完了は待たない。

### 7. メタデータ push の案内

`store.config.json` を App Store Connect に反映したい場合は `/store-config` を別途実行するよう案内する。このスキルでは push しない。

### 8. ビルド残数表示

以下のコマンドで今月のビルド数を取得し、残り回数を表示する:

```bash
eas build:list --platform all --non-interactive --json 2>/dev/null | python3 -c "
import json, sys
from datetime import datetime, timezone
data = json.loads(sys.stdin.read())
now = datetime.now(timezone.utc)
month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
monthly = [b for b in data if datetime.fromisoformat(b['createdAt'].replace('Z','+00:00')) >= month_start]
ios = [b for b in monthly if b['platform'] == 'IOS']
print(f'全体 {len(monthly)}/30回（残り{30-len(monthly)}回）、iOS {len(ios)}/15回（残り{15-len(ios)}回）')
"
```

Free プランの上限: 全体 月30回、iOS 最大15回。
結果を `今月のビルド: 全体 X/30回（残りY回）、iOS X/15回（残りY回）` の形式で表示する。

## 制約

- すべての EAS コマンドに `--non-interactive` フラグを必ず付ける（対話式プロンプトを回避する）
- プロファイルは必ず `testflight` を使用する（`production` や `preview` を使わない）
- `store.config.json` の `version` は `app.json` の `version` と常に同期させる（bump 時は両方更新）
- `releaseNotes` は必ず `ja` ロケール配下に書く（`apple.info.ja.releaseNotes`）
- リリースノートの箇条書きは `・` 記号（中黒）を使い、カテゴリ見出し（新機能 / 改善 / バグ修正）は該当があるときだけ出す
