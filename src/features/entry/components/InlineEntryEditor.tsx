import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { shortDate, type WeekdayKind, weekdayKind } from '@/lib/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';
import { useUpsertEntry } from '../hooks/useEntries';

type Props = {
  date: string;
  /** 入力セッションが終了したとき（保存/破棄問わず）に呼ばれる */
  onComplete: () => void;
};

function weekdayColor(kind: WeekdayKind): string {
  if (kind === 'saturday') return colors.weekday.saturday;
  if (kind === 'sunday') return colors.weekday.sunday;
  return colors.ink.muted;
}

/**
 * 空行タップ時にその行自体がインラインで編集可能になるエディタ。
 * 紙の手帳に書き足す感覚を保つため、ボタンは出さず、
 * Return か blur で確定（空なら破棄）。
 */
export function InlineEntryEditor({ date, onComplete }: Props) {
  const upsert = useUpsertEntry();
  const [draft, setDraft] = useState('');

  // 最新のドラフトを参照するためのref（unmount時commitで使う）
  const draftRef = useRef('');
  draftRef.current = draft;

  // 多重コミット防止（blur → onComplete → unmount の流れで複数回呼ばれるのを防ぐ）
  const committedRef = useRef(false);

  const commit = useCallback(() => {
    if (committedRef.current) return;
    committedRef.current = true;
    const trimmed = draftRef.current.trim();
    if (trimmed.length === 0) return;
    upsert.mutate({ date, word: trimmed });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [date, upsert]);

  // unmount時に未確定の場合でも保存する
  useEffect(() => {
    return () => {
      commit();
    };
  }, [commit]);

  const handleSubmit = () => {
    commit();
    onComplete();
  };

  const handleBlur = () => {
    commit();
    onComplete();
  };

  const kind = weekdayKind(date);

  return (
    <View style={styles.row}>
      <Text style={[styles.date, { color: weekdayColor(kind) }]}>
        {shortDate(date)}
      </Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={handleSubmit}
        onBlur={handleBlur}
        placeholder=""
        placeholderTextColor={colors.ink.subtle}
        style={styles.input}
        returnKeyType="done"
        maxLength={80}
        autoFocus
        autoCorrect={false}
        selectionColor={colors.accent.blue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent.blueSoft,
  },
  date: {
    width: 56,
    fontFamily: 'NotoSerifJP',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  input: {
    flex: 1,
    fontFamily: 'NotoSerifJP',
    fontSize: 17,
    color: colors.ink.primary,
    lineHeight: 24,
    padding: 0,
  },
});
