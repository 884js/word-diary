import { colors } from './colors';

/**
 * 紙の手帳ライトテーマ
 * TamaguiのdefaultConfigから使う標準トークンを埋める。
 * 追加トークンは画面側でcolors直参照 or theme.XXX で拾う。
 */
export const lightTheme = {
  // 背景
  background: colors.paper.base,
  backgroundHover: colors.paper.deep,
  backgroundPress: colors.paper.sunken,
  backgroundFocus: colors.paper.deep,
  backgroundStrong: colors.paper.base,
  backgroundTransparent: 'rgba(250, 248, 243, 0)',

  // テキスト
  color: colors.ink.primary,
  colorHover: colors.ink.primary,
  colorPress: colors.ink.primary,
  colorFocus: colors.ink.primary,
  colorTransparent: 'rgba(30, 26, 22, 0)',

  // ボーダー
  borderColor: colors.ink.ghost,
  borderColorHover: colors.ink.subtle,
  borderColorPress: colors.ink.muted,
  borderColorFocus: colors.accent.blue,

  // シャドウ（ほぼ使わない。紙感を保つ）
  shadowColor: 'rgba(30, 26, 22, 0.04)',
  shadowColorHover: 'rgba(30, 26, 22, 0.06)',
  shadowColorPress: 'rgba(30, 26, 22, 0.08)',
  shadowColorFocus: 'rgba(43, 74, 111, 0.15)',

  // スケール（1=最も明るい、12=最も暗い）
  color1: colors.paper.base,
  color2: colors.paper.deep,
  color3: colors.paper.sunken,
  color4: colors.ink.ghost,
  color5: colors.ink.subtle,
  color6: colors.ink.subtle,
  color7: colors.ink.muted,
  color8: colors.ink.muted,
  color9: colors.ink.secondary,
  color10: colors.ink.secondary,
  color11: colors.ink.primary,
  color12: colors.ink.primary,

  // 意味づけされたトークン（独自）
  paper: colors.paper.base,
  paperDeep: colors.paper.deep,
  inkPrimary: colors.ink.primary,
  inkSecondary: colors.ink.secondary,
  inkMuted: colors.ink.muted,
  inkSubtle: colors.ink.subtle,
  inkGhost: colors.ink.ghost,
  accent: colors.accent.blue,
  accentSoft: colors.accent.blueSoft,
  saturday: colors.weekday.saturday,
  sunday: colors.weekday.sunday,
  success: colors.status.success,
  error: colors.status.error,
};

export const themes = {
  light: lightTheme,
};
