---
name: testflight
description: |
  Build iOS app with EAS Build and distribute to TestFlight using the testflight profile in eas.json.
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
| パッチ（例: 0.1.0 → 0.1.1） | app.json の version を更新 |
| マイナー（例: 0.1.0 → 0.2.0） | app.json の version を更新 |
| メジャー（例: 0.1.0 → 1.0.0） | app.json の version を更新 |

### 3. ビルド方法を選択させる

AskUserQuestion で選択肢を提示する:

| 選択肢 | コマンド |
|--------|---------|
| ビルド＆自動提出（推奨） | `eas build --profile testflight --platform ios --auto-submit --non-interactive` |
| ビルドのみ | `eas build --profile testflight --platform ios --non-interactive` |

### 4. ビルドを実行する

選択されたコマンドを `run_in_background: true` でバックグラウンド実行する。

実行後、TaskOutput（`block: false`）で出力を数回ポーリングし、ビルドURL（`https://expo.dev/...builds/...`）が出力に含まれるまで待つ。最大5回程度、各5秒間隔でチェックする。

### 5. 結果報告

ビルドURLを抽出して表示し、以下を案内する:

- **ビルド＆自動提出の場合**: ビルドURLを表示し、「EAS が自動で TestFlight に提出します。App Store Connect の TestFlight タブで配信状況を確認してください」と案内して終了
- **ビルドのみの場合**: ビルドURLを表示し、「ビルド完了後に以下のコマンドで TestFlight に提出できます」と `eas submit --profile testflight --platform ios --latest --non-interactive` を案内して終了

ビルド完了を待たずに即座に終了する。

### 6. ビルド残数表示

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
