import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  onPress?: () => void;
  /** 直下が SectionDivider の場合に true。下罫線が divider と重なるのを避ける。 */
  hideBottomBorder?: boolean;
};

/**
 * 未記入の日の1行。日付だけ薄く、本文は空白。
 * タップで入力モードへ。
 */
function mutedWeekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  // 土日・祝日でも、未記入日は全体を一段階薄く（紙の上の未記入マス感）
  if (kind === 'saturday') return c.weekday.saturdaySoft;
  if (kind === 'sunday' || kind === 'holiday') return c.weekday.sundaySoft;
  return c.ink.subtle;
}

function EmptyEntryRowInner({ date, onPress, hideBottomBorder }: Props) {
  const c = useColors();
  const kind = weekdayKind(date);
  const borderStyle = hideBottomBorder
    ? { borderBottomWidth: 0 }
    : { borderBottomColor: c.paper.rule };
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: c.paper.sunken }}
      style={({ pressed }) => [
        styles.row,
        borderStyle,
        pressed && { backgroundColor: c.paper.deep },
      ]}
    >
      <Text style={[styles.date, { color: mutedWeekdayColor(kind, c) }]}>
        {shortDate(date)}
      </Text>
      {/* 記入済み行と行高を揃えるための空スロット */}
      <View style={styles.wordSlot} />
    </Pressable>
  );
}

export const EmptyEntryRow = memo(EmptyEntryRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  date: {
    width: 76,
    fontFamily: 'NotoSerifJP',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  wordSlot: {
    flex: 1,
    // EntryRow の word (lineHeight: 24) と行高を揃える
    minHeight: 24,
  },
});
