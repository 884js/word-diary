import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  onPress?: () => void;
};

/**
 * 未記入の日の1行。日付だけ薄く、本文は空白。
 * タップで入力モーダルを開く。
 */
function mutedWeekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  // 土日でも、未記入日は全体を一段階薄く（紙の上の未記入マス感）
  if (kind === 'saturday') return c.weekday.saturdaySoft;
  if (kind === 'sunday') return c.weekday.sundaySoft;
  return c.ink.subtle;
}

function EmptyEntryRowInner({ date, onPress }: Props) {
  const c = useColors();
  const kind = weekdayKind(date);
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: c.paper.sunken }}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: c.paper.deep },
      ]}
    >
      <Text style={[styles.date, { color: mutedWeekdayColor(kind, c) }]}>
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
  date: {
    width: 56,
    fontFamily: 'NotoSerifJP',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
});
