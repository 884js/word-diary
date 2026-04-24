import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  word: string;
};

function weekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  if (kind === 'saturday') return c.weekday.saturday;
  if (kind === 'sunday') return c.weekday.sunday;
  return c.ink.muted;
}

function EntryRowInner({ date, word }: Props) {
  const c = useColors();
  const kind = weekdayKind(date);
  return (
    <View style={styles.row}>
      <Text style={[styles.date, { color: weekdayColor(kind, c) }]}>
        {shortDate(date)}
      </Text>
      <Text style={[styles.word, { color: c.ink.primary }]} numberOfLines={1}>
        {word}
      </Text>
    </View>
  );
}

export const EntryRow = memo(EntryRowInner);

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
  word: {
    flex: 1,
    fontFamily: 'NotoSerifJP',
    fontSize: 17,
    lineHeight: 24,
  },
});
