import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { SquareCells } from './SquareCells';

type Props = {
  date: string;
  word: string;
  /**
   * 行タップ時のハンドラ。
   * 未指定なら読み取り専用の View として描画する（過去エントリの既定挙動）。
   */
  onPress?: () => void;
};

function weekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  if (kind === 'saturday') return c.weekday.saturday;
  if (kind === 'sunday') return c.weekday.sunday;
  return c.ink.muted;
}

/**
 * 原稿用紙の 1 行。
 * 左: 日付マス（M/d(曜)） / 柱罫 / 右: 14 マスの本文
 * 各マスに 1 文字ずつ表示される。文字数が足りないマスは空。
 */
function EntryRowInner({ date, word, onPress }: Props) {
  const c = useColors();
  const kind = weekdayKind(date);

  const content = (
    <>
      <Text
        style={[
          styles.date,
          { color: weekdayColor(kind, c), borderRightColor: c.paper.rule },
        ]}
      >
        {shortDate(date)}
      </Text>
      <SquareCells
        word={word}
        textColor={c.ink.primary}
        ruleColor={c.paper.rule}
      />
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, { borderColor: c.paper.rule }]}>{content}</View>
    );
  }

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
      {content}
    </Pressable>
  );
}

export const EntryRow = memo(EntryRowInner);

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
