import { Settings as SettingsIcon } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { holidayName, longDate } from '@/lib/dateUtils';
import { useToday } from '@/lib/hooks/useToday';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import { useEntries } from '../hooks/useEntries';

/**
 * 画面上部の固定ヘッダー。
 *
 * 構成:
 * - 1 行目: 日付（左 / editorial サイズ） + 通し番号と歯車（右）
 * - 2 行目: 祝日名（祝日のときだけ表示。日曜と同じ赤系）
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
  const holiday = holidayName(today);

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
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
      {holiday ? (
        <Text style={[styles.holidayName, { color: c.weekday.sunday }]}>
          {holiday}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  holidayName: {
    fontFamily: 'NotoSerifJP',
    fontSize: 13,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
});
