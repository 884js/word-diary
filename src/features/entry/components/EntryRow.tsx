import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  word: string;
};

function weekdayColor(kind: WeekdayKind): string {
  if (kind === 'saturday') return colors.weekday.saturday;
  if (kind === 'sunday') return colors.weekday.sunday;
  return colors.ink.muted;
}

function EntryRowInner({ date, word }: Props) {
  const kind = weekdayKind(date);
  return (
    <View style={styles.row}>
      <Text style={[styles.date, { color: weekdayColor(kind) }]}>
        {shortDate(date)}
      </Text>
      <Text style={styles.word} numberOfLines={1}>
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
    color: colors.ink.primary,
    lineHeight: 24,
  },
});
