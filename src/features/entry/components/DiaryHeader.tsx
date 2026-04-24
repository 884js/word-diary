import { Settings as SettingsIcon } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { longDate, todayKey } from '@/lib/dateUtils';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

/**
 * 画面上部の固定ヘッダー。
 * 今日の日付（大）＋設定への導線（右端の歯車）を常時表示する。
 * 今日の記入状態に関わらず出し続けることで、設定への動線と
 * 「いま何月何日か」のアンカーを維持する。
 */
export function DiaryHeader() {
  const c = useColors();
  const router = useRouter();
  const today = todayKey();

  return (
    <View style={styles.container}>
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
    fontSize: 26,
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: spacing.xs,
  },
});
