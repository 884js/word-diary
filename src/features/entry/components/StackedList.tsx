import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { Entry } from '@/lib/database/schema';
import {
  enumerateDates,
  monthLabel,
  monthOf,
  todayKey,
  yearMonthLabel,
  yearOf,
} from '@/lib/dateUtils';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { useEntries } from '../hooks/useEntries';
import { EmptyEntryRow } from './EmptyEntryRow';
import { EntryRow } from './EntryRow';
import { InlineEntryEditor } from './InlineEntryEditor';
import { SectionDivider } from './SectionDivider';

type Item =
  | { kind: 'entry'; entry: Entry }
  | { kind: 'empty'; date: string }
  | { kind: 'divider-year'; key: string; label: string; count: number }
  | { kind: 'divider-month'; key: string; label: string };

type Props = {
  editingDate: string | null;
  onStartEdit: (date: string) => void;
  onEndEdit: () => void;
};

/**
 * 最古のエントリ日〜今日までの全日を新しい順に並べ、
 * 月/年の境界に区切りアイテムを挿入する。
 *
 * ルール:
 * - 未記入の今日は表示しない（TodayComposer が担当）
 * - 記入済みの今日は一覧の最上段に EntryRow として現れる（積み上げ感）
 * - 年が変わる境界は "YYYY年 M月" の年ラベル（月ラベルは出さない）
 * - 同じ年で月だけ変わる境界は "M月" の月ラベル
 * - 最新ブロック（今日と同じ年・同じ月の領域）にはラベルを出さない
 */
function buildItems(entries: Entry[]): Item[] {
  const today = todayKey();
  if (entries.length === 0) return [];

  const earliestDate = entries[entries.length - 1].date;
  // 昇順で全日を列挙して、新しい順に並べ替え
  const allDates = enumerateDates(earliestDate, today).reverse();

  const entryByDate = new Map(entries.map((e) => [e.date, e] as const));

  // 年ごとの記録数
  const countByYear = new Map<string, number>();
  for (const e of entries) {
    const y = yearOf(e.date);
    countByYear.set(y, (countByYear.get(y) ?? 0) + 1);
  }

  const currentYear = yearOf(today);
  const currentMonth = monthOf(today);

  const items: Item[] = [];
  let lastYear: string | null = null;
  let lastMonth: string | null = null;

  for (const date of allDates) {
    // 未記入の今日だけは TodayComposer が兼ねるのでスキップ
    if (date === today && !entryByDate.has(date)) continue;

    const y = yearOf(date);
    const m = monthOf(date);

    if (y !== lastYear) {
      if (y !== currentYear) {
        // 過去の年に入った → 年ラベル（月も含める）
        items.push({
          kind: 'divider-year',
          key: `year-${y}`,
          label: yearMonthLabel(m),
          count: countByYear.get(y) ?? 0,
        });
      } else if (m !== currentMonth) {
        // 今年内だが今月と違う → 月ラベル
        items.push({
          kind: 'divider-month',
          key: `month-${m}`,
          label: monthLabel(m),
        });
      }
      lastYear = y;
      lastMonth = m;
    } else if (m !== lastMonth) {
      items.push({
        kind: 'divider-month',
        key: `month-${m}`,
        label: monthLabel(m),
      });
      lastMonth = m;
    }

    const entry = entryByDate.get(date);
    if (entry) {
      items.push({ kind: 'entry', entry });
    } else {
      items.push({ kind: 'empty', date });
    }
  }

  return items;
}

export function StackedList({ editingDate, onStartEdit, onEndEdit }: Props) {
  const c = useColors();
  const { data, isLoading } = useEntries();

  const items = useMemo(() => buildItems(data ?? []), [data]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={c.ink.muted} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyBody, { color: c.ink.muted }]}>
          上の欄に今日のひと言を記録すると、{'\n'}ここに積み上がっていきます。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        if (item.kind === 'divider-year') {
          return (
            <SectionDivider
              key={item.key}
              label={item.label}
              subLabel={`書いた日数 ${item.count}日`}
              variant="year"
            />
          );
        }
        if (item.kind === 'divider-month') {
          return (
            <SectionDivider key={item.key} label={item.label} variant="month" />
          );
        }
        // entry / empty は編集中かどうかで描画を切り替える
        const itemDate = item.kind === 'entry' ? item.entry.date : item.date;
        const existingWord =
          item.kind === 'entry' ? item.entry.word : undefined;

        if (editingDate === itemDate) {
          return (
            <InlineEntryEditor
              key={`editor-${itemDate}`}
              date={itemDate}
              initialValue={existingWord}
              onComplete={onEndEdit}
            />
          );
        }

        if (item.kind === 'entry') {
          return (
            <EntryRow
              key={item.entry.id}
              date={item.entry.date}
              word={item.entry.word}
              onPress={() => onStartEdit(item.entry.date)}
            />
          );
        }

        return (
          <EmptyEntryRow
            key={`empty-${item.date}`}
            date={item.date}
            onPress={() => onStartEdit(item.date)}
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
  emptyBody: {
    fontFamily: 'NotoSerifJP',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
  },
});
