/**
 * 紙の手帳デザイントークン
 */

export const spacing = {
  0: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
} as const;

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  full: 9999,
} as const;

export const durations = {
  instant: 80,
  fast: 120,
  base: 180,
  slow: 240,
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  toast: 40,
  modal: 50,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
