/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
// 色は targets/widget/Assets.xcassets/*.colorset/Contents.json で直接管理する。
// プラグイン経由 (colors:) で渡すと color-space が display-p3 に強制され、
// アプリ側 (sRGB) と色味が一致しなくなるため。詳細は src/theme/colors.ts のメモ参照。
module.exports = (config) => ({
  type: 'widget',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.uki884.worddiary'],
  },
});
