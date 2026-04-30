import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { useDeleteEntry, useUpsertEntry } from '../hooks/useEntries';

type Props = {
  date: string;
  /**
   * 再編集時の初期値。未指定なら空から書き始める。
   * 既存の単語と同じまま blur すると不要な upsert をスキップする。
   */
  initialValue?: string;
  /** 入力セッションが終了したとき（保存/破棄問わず）に呼ばれる */
  onComplete: () => void;
  /** 直下が SectionDivider の場合に true。下罫線が divider と重なるのを避ける。 */
  hideBottomBorder?: boolean;
};

function weekdayColor(kind: WeekdayKind, c: ColorScheme): string {
  if (kind === 'saturday') return c.weekday.saturday;
  if (kind === 'sunday' || kind === 'holiday') return c.weekday.sunday;
  return c.ink.muted;
}

/**
 * 空行タップ時にその行自体がインラインで編集可能になるエディタ。
 * 紙の手帳に書き足す感覚を保つため、ボタンは出さず、
 * Return か blur で確定（空なら破棄）。
 */
export function InlineEntryEditor({
  date,
  initialValue,
  onComplete,
  hideBottomBorder,
}: Props) {
  const c = useColors();
  const upsert = useUpsertEntry();
  const deleteEntry = useDeleteEntry();
  const [draft, setDraft] = useState(initialValue ?? '');

  // 多重コミット防止（blur → onComplete → unmount の流れで複数回呼ばれるのを防ぐ）
  const committedRef = useRef(false);

  // commit 関数は毎レンダーで最新クロージャに更新する。
  // useEffect の cleanup を [] deps で unmount 時のみに限定するため、ref 経由で最新値を参照する。
  const commitRef = useRef<() => void>(() => {});
  commitRef.current = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    const trimmed = draft.trim();
    // 既存エントリがあるのに本文を空にした = 削除したい意図。
    // 紙の手帳で「消しゴムで消したらマスだけ残る」に相当する挙動。
    if (trimmed.length === 0) {
      if (initialValue) {
        deleteEntry.mutate(date);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      return;
    }
    // 既存の単語と同一なら書き込みしない（updatedAt を無駄に動かさない）
    if (trimmed === initialValue) return;
    upsert.mutate({ date, word: trimmed });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // unmount時に未確定の場合でも保存する。deps を [] にすることで
  // レンダー毎の cleanup 実行を防ぐ（以前はタイピング中に誤発火していた）。
  useEffect(() => {
    return () => {
      commitRef.current();
    };
  }, []);

  const handleSubmit = () => {
    commitRef.current();
    onComplete();
  };

  const handleBlur = () => {
    commitRef.current();
    onComplete();
  };

  const kind = weekdayKind(date);

  const borderStyle = hideBottomBorder
    ? { borderBottomWidth: 0 }
    : { borderBottomColor: c.paper.rule };

  return (
    <View style={[styles.row, borderStyle]}>
      <Animated.View
        pointerEvents="none"
        entering={FadeIn.duration(200)}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: c.accent.blueSoft },
        ]}
      />
      <Text style={[styles.date, { color: weekdayColor(kind, c) }]}>
        {shortDate(date)}
      </Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={handleSubmit}
        onBlur={handleBlur}
        placeholder=""
        placeholderTextColor={c.ink.subtle}
        style={[styles.input, { color: c.ink.primary }]}
        returnKeyType="done"
        maxLength={14}
        autoFocus
        autoCorrect={false}
        selectTextOnFocus
        selectionColor={c.accent.blue}
      />
    </View>
  );
}

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
  input: {
    flex: 1,
    fontFamily: 'NotoSerifJP',
    fontSize: 17,
    lineHeight: 24,
    padding: 0,
  },
});
