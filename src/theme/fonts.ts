import { createFont } from '@tamagui/core';

/**
 * 明朝フォント（Noto Serif JP）
 * body / heading / date（mono的に桁揃え）の3系統を定義
 *
 * 後でフォントカスタマイズ機能を入れるときは、
 * このファイルが唯一の差し替えポイントになる想定。
 */

const serif = createFont({
  family: 'NotoSerifJP',
  size: {
    1: 10,
    2: 11,
    3: 12,
    4: 13,
    5: 15, // body
    6: 16,
    7: 18, // prompt / list item
    8: 20,
    9: 22, // input
    10: 26,
    11: 30, // hero date
    12: 36,
    13: 44,
    14: 56,
    15: 72,
    16: 96,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 22,
    5: 24,
    6: 26,
    7: 30,
    8: 32,
    9: 34,
    10: 38,
    11: 44,
    12: 52,
    13: 62,
    14: 76,
    15: 96,
    16: 120,
  },
  weight: {
    1: '400',
    2: '400',
    3: '400',
    4: '400',
    5: '400',
    6: '400',
    7: '500',
    8: '500',
    9: '500',
    10: '600',
    11: '600',
    12: '700',
    13: '700',
    14: '700',
    15: '700',
    16: '700',
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
  },
  face: {
    400: { normal: 'NotoSerifJP' },
    500: { normal: 'NotoSerifJPMedium' },
    700: { normal: 'NotoSerifJPBold' },
  },
});

const heading = createFont({
  ...serif,
  weight: {
    ...serif.weight,
    9: '500',
    10: '500',
    11: '600',
    12: '600',
  },
});

// 日付・数字用（明朝でも読みやすいサイズ）
const mono = createFont({
  ...serif,
});

export const fonts = {
  heading,
  body: serif,
  mono,
};
