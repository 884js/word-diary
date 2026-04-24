import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type Props = {
  date: string;
  word: string;
  /**
   * 行タップ時のハンドラ。
   * 未指定なら読み取り専用の View として描画する（過去エントリの既定挙動）。
   * 今日の行など、再編集を許す場合だけ渡す。
   */
  onPress?: () => void;
};

function weekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  if (kind === 'saturday') return c.weekday.saturday;
  if (kind === 'sunday') return c.weekday.sunday;
  return c.ink.muted;
}

function EntryRowInner({ date, word, onPress }: Props) {
  const c = useColors();
  const kind = weekdayKind(date);

  const content = (
    <>
      <Text style={[styles.date, { color: weekdayColor(kind, c) }]}>
        {shortDate(date)}
      </Text>
      <Text style={[styles.word, { color: c.ink.primary }]} numberOfLines={1}>
        {word}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: c.paper.sunken }}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: c.paper.deep },
      ]}
    >
      {content}
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
