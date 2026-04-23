import { useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { Entry } from '@/lib/database/schema';
import {
  monthLabel,
  monthOf,
  todayKey,
  yearLabel,
  yearOf,
} from '@/lib/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';
import { useDeleteEntry, useEntries } from '../hooks/useEntries';
import { EntryRow } from './EntryRow';
import { SectionDivider } from './SectionDivider';

type Item =
  | { kind: 'entry'; entry: Entry }
  | { kind: 'month'; key: string; label: string }
  | { kind: 'year'; key: string; label: string };

/**
 * エントリを「年 > 月 > エントリ」の順に並べ、
 * 区切りアイテムを挿入したフラットなリストを返す。
 * （年が変わるごとに年区切り、月が変わるごとに月区切り）
 * 今日を含む月・年の区切りは出さない（TodayComposerが兼ねる）。
 */
function buildItems(entries: Entry[]): Item[] {
  const today = todayKey();
  const currentMonth = monthOf(today);
  const currentYear = yearOf(today);

  const items: Item[] = [];
  let lastMonth: string | null = null;
  let lastYear: string | null = null;

  for (const entry of entries) {
    const y = yearOf(entry.date);
    const m = monthOf(entry.date);

    if (y !== lastYear) {
      // 今年の最初のブロックには年区切りは出さない
      if (lastYear !== null || y !== currentYear) {
        items.push({ kind: 'year', key: `year-${y}`, label: yearLabel(y) });
      }
      lastYear = y;
    }
    if (m !== lastMonth) {
      // 今月の最初のブロックには月区切りは出さない
      if (lastMonth !== null || m !== currentMonth) {
        items.push({ kind: 'month', key: `month-${m}`, label: monthLabel(m) });
      }
      lastMonth = m;
    }

    items.push({ kind: 'entry', entry });
  }

  return items;
}

export function StackedList() {
  const { data, isLoading } = useEntries();
  const deleteMutation = useDeleteEntry();

  const items = useMemo(() => buildItems(data ?? []), [data]);

  const handleLongPress = (entry: Entry) => {
    Alert.alert(
      '削除しますか？',
      `${entry.date}  ${entry.word}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(entry.date),
        },
      ],
      { cancelable: true },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink.muted} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>まだ何も書かれていません</Text>
        <Text style={styles.emptyBody}>
          上の欄に今日のひと言を記録すると、{'\n'}ここに積み上がっていきます。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <SectionDivider label="積み上げ" variant="section" />
      {items.map((item) => {
        if (item.kind === 'year') {
          return (
            <SectionDivider key={item.key} label={item.label} variant="year" />
          );
        }
        if (item.kind === 'month') {
          return (
            <SectionDivider key={item.key} label={item.label} variant="month" />
          );
        }
        return (
          <EntryRow
            key={item.entry.id}
            date={item.entry.date}
            word={item.entry.word}
            onLongPress={() => handleLongPress(item.entry)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing['4xl'],
  },
  loading: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  empty: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 15,
    color: colors.ink.secondary,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontFamily: 'NotoSerifJP',
    fontSize: 13,
    color: colors.ink.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
