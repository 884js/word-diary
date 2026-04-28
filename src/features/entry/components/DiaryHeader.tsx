import { Settings as SettingsIcon } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { longDate } from '@/lib/dateUtils';
import { useToday } from '@/lib/hooks/useToday';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { useEntries } from '../hooks/useEntries';

/**
 * 画面上部の固定ヘッダー。
 *
 * 構成:
 * - 左: 今日の日付（editorial なサイズで第一印象を作る）
 * - 右上: 通し番号（これまで書いた日数）と歯車
 *
 * 通し番号は記録が 1 件以上あるときのみ表示する。
 * 0 件の初期状態で "No. 000" を出すと、かえって記帳ハードルを上げるため。
 */
export function DiaryHeader() {
  const c = useColors();
  const router = useRouter();
  const today = useToday();
  const { data } = useEntries();

  const count = data?.length ?? 0;
  const showCount = count > 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.date, { color: c.ink.primary }]}>
        {longDate(today)}
      </Text>
      <View style={styles.rightCluster}>
        {showCount ? (
          <Text style={[styles.counter, { color: c.ink.muted }]}>
            No. {count.toString().padStart(3, '0')}
          </Text>
        ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  date: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 30,
    letterSpacing: 1.2,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counter: {
    fontFamily: 'NotoSerifJP',
    fontSize: 12,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  settingsButton: {
    padding: spacing.xs,
  },
});
