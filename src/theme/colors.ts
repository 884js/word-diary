/**
 * 紙の手帳パレット（A案: 温かみのあるオフホワイト＋インク）
 *
 * デザイン原則:
 * - 純黒・純白は使わない（眼精疲労と冷たさを避ける）
 * - アクセントは1画面1色まで
 * - 曜日色分けは彩度を抑えて控えめに
 */
export const colors = {
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
    sunday: '#9C3B3B', // 日曜：落ち着いた赤
  },

  // 状態色（最小限）
  status: {
    success: '#527A52',
    error: '#A85240',
  },
} as const;

export type ColorScheme = typeof colors;
