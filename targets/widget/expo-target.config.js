/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.uki884.worddiary",
    ],
  },
  colors: {
    $widgetBackground: { light: "#FAF8F3", dark: "#1C1B18" },
    $accent: { light: "#5B6B47", dark: "#A8B98F" },
    paperBase: { light: "#FAF8F3", dark: "#1C1B18" },
    paperRule: { light: "#C4D5BB", dark: "#3D4A38" },
    inkPrimary: { light: "#1F1F1B", dark: "#E8E6DD" },
    inkMuted: { light: "#6F6E68", dark: "#A6A39A" },
    weekdaySaturday: { light: "#496EA9", dark: "#7E9DD6" },
    weekdaySunday: { light: "#B94D43", dark: "#E27871" },
  },
});
