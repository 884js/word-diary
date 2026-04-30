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
  /** 直下が SectionDivider の場合に true。下罫線が divider と重なるのを避ける。 */
  hideBottomBorder?: boolean;
};

function weekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  if (kind === 'saturday') return c.weekday.saturday;
  // 祝日は紙の手帳の慣習に従い日曜と同じ赤
  if (kind === 'sunday' || kind === 'holiday') return c.weekday.sunday;
  return c.ink.muted;
}

function EntryRowInner({ date, word, onPress, hideBottomBorder }: Props) {
  const c = useColors();
  const kind = weekdayKind(date);

  const content = (
    <>
      <Text style={[styles.date, { color: weekdayColor(kind, c) }]}>
        {shortDate(date)}
      </Text>
      <Text style={[styles.word, { color: c.ink.primary }]} numberOfLines={2}>
        {word}
      </Text>
    </>
  );

  const borderStyle = hideBottomBorder
    ? { borderBottomWidth: 0 }
    : { borderBottomColor: c.paper.rule };

  if (!onPress) {
    return <View style={[styles.row, borderStyle]}>{content}</View>;
  }

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
      {content}
    </Pressable>
  );
}

export const EntryRow = memo(EntryRowInner);

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
  word: {
    flex: 1,
    fontFamily: 'NotoSerifJP',
    fontSize: 17,
    lineHeight: 24,
  },
});
