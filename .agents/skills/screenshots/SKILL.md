---
name: screenshots
description: |
  Capture App Store submission screenshots on the iOS simulator and save them under screenshots/.
  Use when: (1) /screenshots command (2) user says「スクショ撮って」「スクリーンショット更新」「App Store スクショ」「スクショ取り直し」or similar phrases about iOS App Store screenshots.
---

# App Store スクリーンショット撮影

## 保存先

`screenshots/` 配下に保存する。ファイル名は `01-home.png` / `02-composer.png` のように **連番 + 用途名** で管理する。

## App Store 要件

- iPhone 6.9" ディスプレイ: **1290 × 2796 px** が必須
- この解像度で撮るには以下のシミュレータを使用する:
  - iPhone 17 Pro Max
  - iPhone 16 Pro Max

## 手順

### 1. 起動中のシミュレータを確認

```bash
xcrun simctl list devices booted
```

6.9" 以外の機種が起動している場合は、Xcode → Open Developer Tool → Simulator で切り替えるか、ユーザーに切り替えを依頼する。

### 2. アプリを目的の画面に遷移させる

撮影したい画面までアプリを操作する（ユーザーが操作する。必要ならどの画面を出すか案内する）。

### 3. 撮影

既存のスクショ一覧を確認:

```bash
ls screenshots/ 2>/dev/null || mkdir -p screenshots
```

次の連番を推定して撮影する:

```bash
xcrun simctl io booted screenshot screenshots/01-home.png
```

連続して複数撮る場合:

```bash
xcrun simctl io booted screenshot screenshots/01-home.png
xcrun simctl io booted screenshot screenshots/02-composer.png
xcrun simctl io booted screenshot screenshots/03-list.png
```

### 4. 解像度確認

撮影後、要件を満たしているか確認:

```bash
sips -g pixelWidth -g pixelHeight screenshots/01-home.png
```

`pixelWidth: 1290` と `pixelHeight: 2796` になっていなければ、シミュレータ機種が違う可能性がある。

### 5. App Store Connect へアップロード

ユーザーに以下を案内する:

1. [App Store Connect](https://appstoreconnect.apple.com/) にログイン
2. 対象アプリ → 対応バージョン → iOS プレビューとスクリーンショット → 6.9" ディスプレイ
3. `screenshots/` 内の画像をドラッグ&ドロップ

## 注意

- 既存スクショを置き換える場合は、App Store Connect 側の既存スクショを先に削除してからアップロードする
- スクショは原則 5 枚以内が見やすい（最大 10 枚まで設定可能）
- 言語設定が日本語のストアなら、端末の言語も日本語にしておく
