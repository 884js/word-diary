import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  word: string;
  highlight?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

function weekdayColor(kind: WeekdayKind): string {
  if (kind === 'saturday') return colors.weekday.saturday;
  if (kind === 'sunday') return colors.weekday.sunday;
  return colors.ink.muted;
}

function EntryRowInner({ date, word, highlight, onPress, onLongPress }: Props) {
  const kind = weekdayKind(date);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: colors.paper.sunken }}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        highlight && styles.rowHighlight,
      ]}
    >
      <Text style={[styles.date, { color: weekdayColor(kind) }]}>
        {shortDate(date)}
      </Text>
      <Text style={styles.word} numberOfLines={1}>
        {word}
      </Text>
    </Pressable>
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
  rowPressed: {
    backgroundColor: colors.paper.deep,
  },
  rowHighlight: {
    backgroundColor: colors.accent.blueSoft,
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
