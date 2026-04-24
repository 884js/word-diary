/**
 * 紙の手帳パレット（light / dark）
 *
 * デザイン原則:
 * - 純黒・純白は使わない（眼精疲労と冷たさを避ける）
 * - dark は「夜の紙」。真っ黒ではなく温かみのあるダークブラウン寄り
 * - アクセントは1画面1色まで
 * - 曜日色分けは彩度を抑えて控えめに
 */

export type ColorScheme = {
  paper: {
    base: string;
    deep: string;
    sunken: string;
  };
  ink: {
    primary: string;
    secondary: string;
    muted: string;
    subtle: string;
    ghost: string;
  };
  accent: {
    blue: string;
    blueSoft: string;
  };
  weekday: {
    saturday: string;
    saturdaySoft: string;
    sunday: string;
    sundaySoft: string;
  };
  status: {
    success: string;
    error: string;
  };
};

export const lightColors: ColorScheme = {
  paper: {
    base: '#FAF8F3', // 生成りのベース
    deep: '#F2EFE6', // セクション区切りの軽い陰影
    sunken: '#EBE7DB', // さらに一段落ち着いた背景
  },

  ink: {
    primary: '#1E1A16', // 本文（ほぼ黒、少し温かい）
    secondary: '#5A524A', // 中間階層
    muted: '#8A827A', // 日付・プロンプト
    subtle: '#BFB8AE', // 区切り線
    ghost: '#E3DED3', // ごく薄い罫線
  },

  accent: {
    blue: '#2B4A6F', // インクブルー（主アクセント）
    blueSoft: '#E3E9F1', // 入力欄のフォーカス時など
  },

  weekday: {
    saturday: '#2F6FA5', // 土曜：落ち着いた青
    saturdaySoft: '#7EA2C4', // 土曜（空白日の薄い版）
    sunday: '#9C3B3B', // 日曜：落ち着いた赤
    sundaySoft: '#C49090', // 日曜（空白日の薄い版）
  },

  status: {
    success: '#527A52',
    error: '#A85240',
  },
};

/**
 * dark は「夜の紙」。
 * - base を一番暗い色に、deep/sunken はわずかに明るめ（iOS/Material の elevation 慣習に従う）
 * - ink は紙色ベースを反転したクリーム系
 */
export const darkColors: ColorScheme = {
  paper: {
    base: '#1C1B18',
    deep: '#252421',
    sunken: '#2E2D29',
  },

  ink: {
    primary: '#E8E3D8',
    secondary: '#BEB8AB',
    muted: '#8E887C',
    subtle: '#5A554C',
    ghost: '#3A3731',
  },

  accent: {
    blue: '#7FA7D3', // 暗背景でのコントラスト確保のため明るめに
    blueSoft: '#2D3A4C',
  },

  weekday: {
    saturday: '#7FA7D3',
    saturdaySoft: '#4E6D8B',
    sunday: '#E09090',
    sundaySoft: '#8A5E5E',
  },

  status: {
    success: '#7CA67C',
    error: '#D07060',
  },
};

/**
 * @deprecated 後方互換のための alias。新規コードでは `useColors()` を使うこと。
 */
export const colors = lightColors;
