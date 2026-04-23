import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  onPress?: () => void;
};

/**
 * 未記入の日の1行。日付だけ薄く、本文は空白。
 * タップで入力モーダルを開く。
 */
function mutedWeekdayColor(kind: WeekdayKind): string {
  // 土日でも、未記入日は全体を一段階薄く（紙の上の未記入マス感）
  if (kind === 'saturday') return '#7EA2C4'; // 青の薄い版
  if (kind === 'sunday') return '#C49090'; // 赤の薄い版
  return colors.ink.subtle;
}

function EmptyEntryRowInner({ date, onPress }: Props) {
  const kind = weekdayKind(date);
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.paper.sunken }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={[styles.date, { color: mutedWeekdayColor(kind) }]}>
        {shortDate(date)}
      </Text>
    </Pressable>
  );
}

export const EmptyEntryRow = memo(EmptyEntryRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  rowPressed: {
    backgroundColor: colors.paper.deep,
  },
  date: {
    width: 56,
    fontFamily: 'NotoSerifJP',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
});
