import { X } from '@tamagui/lucide-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/theme/ThemeContext';
import { radius, spacing } from '@/theme/tokens';
import { useVersionCheck } from '../hooks/useVersionCheck';

/**
 * 「新しいバージョンがあります」バナー。
 * - 1 日 1 回の iTunes Lookup 判定後に表示される。
 * - タップで App Store を開く。× で当日のみ非表示。
 * - DiaryHeader の直下に控えめに置く想定。
 */
export function UpdateBanner() {
  const c = useColors();
  const { show, update, dismiss } = useVersionCheck();

  if (!show || !update) return null;

  const openStore = () => {
    Linking.openURL(update.storeUrl).catch(() => {
      // 開けない環境 (エミュレータ等) では何もしない。
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.paper.deep,
          borderColor: c.ink.ghost,
        },
      ]}
    >
      <Pressable
        onPress={openStore}
        accessibilityRole="button"
        accessibilityLabel={`バージョン ${update.latestVersion} に更新する`}
        style={({ pressed }) => [styles.tapArea, pressed && { opacity: 0.5 }]}
      >
        <Text style={[styles.title, { color: c.ink.primary }]}>
          新しいバージョン ({update.latestVersion}) が公開されています
        </Text>
        <Text style={[styles.subtitle, { color: c.ink.muted }]}>
          タップして App Store で更新
        </Text>
      </Pressable>
      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="通知を閉じる"
        hitSlop={12}
        style={({ pressed }) => [styles.close, pressed && { opacity: 0.5 }]}
      >
        <X size={16} color="$inkMuted" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
  },
  tapArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: 'NotoSerifJP',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  close: {
    padding: spacing.sm,
  },
});
