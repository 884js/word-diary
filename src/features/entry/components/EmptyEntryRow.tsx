import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { SquareCells } from './SquareCells';

type Props = {
  date: string;
  onPress?: () => void;
};

/**
 * 未記入の日のマス行。日付だけ薄く、本文マスは全て空。
 * 原稿用紙の「空マスが並んでいる」状態で、埋めたくなる視覚装置になる。
 */
function mutedWeekdayColor(kind: WeekdayKind, c: ColorScheme): string {
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
        { borderColor: c.paper.rule },
        pressed && { backgroundColor: c.paper.deep },
      ]}
    >
      <Text
        style={[
          styles.date,
          {
            color: mutedWeekdayColor(kind, c),
            borderRightColor: c.paper.rule,
          },
        ]}
      >
        {shortDate(date)}
      </Text>
      <SquareCells textColor={c.ink.primary} ruleColor={c.paper.rule} />
    </Pressable>
  );
}

export const EmptyEntryRow = memo(EmptyEntryRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  date: {
    width: 64,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    borderRightWidth: StyleSheet.hairlineWidth,
    fontFamily: 'NotoSerifJP',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
