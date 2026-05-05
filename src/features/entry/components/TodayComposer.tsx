import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeOutUp } from 'react-native-reanimated';
import { useToday } from '@/lib/hooks/useToday';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { useTodayEntry, useUpsertEntry } from '../hooks/useEntries';

/**
 * プレースホルダー例として使う「ひと言」の候補。
 *
 * 起動ごとに 1 つだけランダムで選ばれる（モジュールスコープなので、
 * TodayComposer が再マウントしても値は変わらない）。
 * フォーカス変化や記入→削除のタイミングで例示が変わると違和感が
 * 出るため、セッション中は固定する。
 *
 * 方針: 継続して書いてもらうことを優先するため、
 * 「単語＋動詞」「感情ひと言」「天気ひと言」など多様な書き方を見せ、
 * 書き手のハードルを下げる。日常頻度の高い候補に寄せる。
 */
const PLACEHOLDER_SAMPLES = [
  // 行動・食事
  '映画を観た',
  '散歩した',
  'ラーメン食べた',
  '本を読んだ',
  '料理した',
  'コーヒーを飲んだ',
  'カフェに行った',
  '友達と話した',
  // 過ごし方
  '早起きした',
  '朝寝坊した',
  'ぼーっとした',
  '音楽を聴いた',
  // 余暇
  'ドラマを観た',
  '昼寝した',
  // 天気
  '雨だった',
  '晴れた一日',
  '寒かった',
  // 感情
  'うれしかった',
  '疲れた',
  'がんばった',
] as const;

const PLACEHOLDER_SAMPLE =
  PLACEHOLDER_SAMPLES[Math.floor(Math.random() * PLACEHOLDER_SAMPLES.length)];

/**
 * 今日のひと言を入力するコンポーザ。
 * - 未記入: 入力欄 + 記録ボタン
 * - 記入済: 何も描画しない（一覧の最上段で表示・編集する）
 *
 * ヘッダー（日付・歯車）は DiaryHeader が、
 * 上部のプロンプト文言は PromptText が担当するのでここには置かない。
 */
export function TodayComposer() {
  const c = useColors();
  const today = useToday();
  const { data: todayEntry } = useTodayEntry();
  const upsert = useUpsertEntry();

  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  // 入力があるときだけ「記録する」を強調色＆押下可能にする。
  // ボタン自体は常時表示で、書き始める前は薄い色で disabled に見せる。
  const canSubmit = draft.trim().length > 0;

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await upsert.mutateAsync({ date: today, word: trimmed });
    // 成功後は draft を空にしておく。そのまま日付が変わって
    // Composer が再表示されたとき、前日の内容が残って見えるのを防ぐ。
    setDraft('');
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // 保存後は todayEntry が入ってこのコンポーネントは null を返すので、
    // UIは自然に閉じて一覧の最上段に今日の行が現れる
  };

  if (todayEntry) {
    return null;
  }

  return (
    <Animated.View style={styles.container} exiting={FadeOutUp.duration(400)}>
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
          placeholder={PLACEHOLDER_SAMPLE}
          placeholderTextColor={c.ink.subtle}
          style={[styles.input, { color: c.ink.primary }]}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          maxLength={MAX_LENGTH}
          autoCorrect={false}
        />
      </View>

      <View style={styles.actionRow}>
        <Text style={[styles.counter, { color: c.ink.muted }]}>
          あと {MAX_LENGTH - draft.length} 字
        </Text>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || upsert.isPending}
        >
          <Text
            style={[
              styles.action,
              { color: canSubmit ? c.accent.blue : c.ink.subtle },
            ]}
          >
            記録する
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

/**
 * ひと言日記としての性格を保つため、入力は短く制限する。
 * 14 という数字は「単語〜短いフレーズ」が成立する最低限のライン。
 */
const MAX_LENGTH = 14;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  inputRow: {
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    minHeight: 24,
  },
  counter: {
    fontFamily: 'NotoSerifJP',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  action: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 15,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
