import { Settings as SettingsIcon } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { longDate, todayKey } from '@/lib/dateUtils';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { useTodayEntry, useUpsertEntry } from '../hooks/useEntries';

/**
 * プレースホルダー例として使う「その日を象徴するひと言」候補。
 * 起動ごとにランダムで1つ選ばれる。
 */
const PLACEHOLDER_SAMPLES = [
  '映画',
  '花見',
  '夜景',
  '引っ越し',
  '再会',
  'お祭り',
  '大掃除',
  '旅行',
  'ライブ',
  '温泉',
  'カラオケ',
  '誕生日',
  '忘年会',
  '模様替え',
  'お泊り会',
  '初授業',
  '散歩',
  'ラーメン',
] as const;

/**
 * 今日のひと言を入力するコンポーザ。
 * - 未記入: プロンプト表示 + 入力欄
 * - 記入済: そのまま編集可能な状態で表示
 */
export function TodayComposer() {
  const c = useColors();
  const router = useRouter();
  const today = todayKey();
  const { data: todayEntry } = useTodayEntry();
  const upsert = useUpsertEntry();

  const [draft, setDraft] = useState(todayEntry?.word ?? '');
  const [focused, setFocused] = useState(false);

  // 起動ごとに1つだけ選ばれるプレースホルダー例
  const placeholderSample = useMemo(
    () =>
      PLACEHOLDER_SAMPLES[
        Math.floor(Math.random() * PLACEHOLDER_SAMPLES.length)
      ],
    [],
  );

  // 同期: 取得結果が変わったらドラフトを最新化（ただし編集中は尊重）
  const lastServerWord = useRef<string | undefined>(undefined);
  useEffect(() => {
    const w = todayEntry?.word ?? '';
    if (w !== lastServerWord.current) {
      setDraft(w);
      lastServerWord.current = w;
    }
  }, [todayEntry?.word]);

  // 記録ボタンの出現アニメーション（opacityのみ）
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const showButton = draft.trim().length > 0;
  useEffect(() => {
    Animated.timing(buttonOpacity, {
      toValue: showButton ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [showButton, buttonOpacity]);

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await upsert.mutateAsync({ date: today, word: trimmed });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const isSaved = todayEntry != null && todayEntry.word === draft.trim();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.date, { color: c.ink.primary }]}>
          {longDate(today)}
        </Text>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="設定を開く"
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && { opacity: 0.5 },
          ]}
        >
          <SettingsIcon size={20} color="$inkMuted" />
        </Pressable>
      </View>
      <Text style={[styles.prompt, { color: c.ink.muted }]}>
        {todayEntry ? '今日のひと言。' : '今日を、ひと言で。'}
      </Text>

      <View
        style={[
          styles.inputRow,
          { borderBottomColor: c.ink.subtle },
          focused && { borderBottomColor: c.accent.blue },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={todayEntry ? '' : placeholderSample}
          placeholderTextColor={c.ink.subtle}
          style={[styles.input, { color: c.ink.primary }]}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          maxLength={80}
          autoCorrect={false}
        />
      </View>

      <Animated.View
        style={[styles.actionRow, { opacity: buttonOpacity }]}
        pointerEvents={showButton ? 'auto' : 'none'}
      >
        <Pressable onPress={handleSubmit} disabled={upsert.isPending}>
          <Text style={[styles.action, { color: c.accent.blue }]}>
            {isSaved ? '保存済み' : todayEntry ? '書き直す' : '記録する'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 26,
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  prompt: {
    marginTop: spacing.xs,
    fontFamily: 'NotoSerifJP',
    fontSize: 14,
  },
  inputRow: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  input: {
    fontFamily: 'NotoSerifJP',
    fontSize: 20,
    paddingVertical: spacing.xs,
    padding: 0,
  },
  actionRow: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
    minHeight: 24,
  },
  action: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 15,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
