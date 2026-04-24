import { darkColors, lightColors } from './colors';

/**
 * Tamagui のテーマトークンを light/dark で定義する。
 * カラーパレットは `colors.ts` を参照。
 *
 * 注意: 現状ほとんどの画面は React Native プリミティブ + `useColors()` を使っており、
 * このテーマは主に Tamagui コンポーネントを使ったときのフォールバック。
 */
function buildTheme(c: typeof lightColors) {
  return {
    background: c.paper.base,
    backgroundHover: c.paper.deep,
    backgroundPress: c.paper.sunken,
    backgroundFocus: c.paper.deep,
    backgroundStrong: c.paper.base,
    backgroundTransparent: 'rgba(0, 0, 0, 0)',

    color: c.ink.primary,
    colorHover: c.ink.primary,
    colorPress: c.ink.primary,
    colorFocus: c.ink.primary,
    colorTransparent: 'rgba(0, 0, 0, 0)',

    borderColor: c.ink.ghost,
    borderColorHover: c.ink.subtle,
    borderColorPress: c.ink.muted,
    borderColorFocus: c.accent.blue,

    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowColorHover: 'rgba(0, 0, 0, 0.06)',
    shadowColorPress: 'rgba(0, 0, 0, 0.08)',
    shadowColorFocus: 'rgba(0, 0, 0, 0.15)',

    color1: c.paper.base,
    color2: c.paper.deep,
    color3: c.paper.sunken,
    color4: c.ink.ghost,
    color5: c.ink.subtle,
    color6: c.ink.subtle,
    color7: c.ink.muted,
    color8: c.ink.muted,
    color9: c.ink.secondary,
    color10: c.ink.secondary,
    color11: c.ink.primary,
    color12: c.ink.primary,

    paper: c.paper.base,
    paperDeep: c.paper.deep,
    inkPrimary: c.ink.primary,
    inkSecondary: c.ink.secondary,
    inkMuted: c.ink.muted,
    inkSubtle: c.ink.subtle,
    inkGhost: c.ink.ghost,
    accent: c.accent.blue,
    accentSoft: c.accent.blueSoft,
    saturday: c.weekday.saturday,
    sunday: c.weekday.sunday,
    success: c.status.success,
    error: c.status.error,
  };
}

export const lightTheme = buildTheme(lightColors);
export const darkTheme = buildTheme(darkColors);

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
