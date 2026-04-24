import { Check, ChevronLeft } from '@tamagui/lucide-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEntries } from '@/features/entry/hooks/useEntries';
import { fullDate } from '@/lib/dateUtils';
import type { ColorScheme } from '@/theme/colors';
import { type ThemeMode, useColors, useThemeMode } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type ThemeOption = {
  mode: ThemeMode;
  label: string;
  description: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    mode: 'system',
    label: 'システム設定に従う',
    description: '端末のダークモードに連動',
  },
  { mode: 'light', label: 'ライト', description: '昼間の紙' },
  { mode: 'dark', label: 'ダーク', description: '夜の紙' },
];

export default function SettingsScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, setMode } = useThemeMode();
  const { data: entries } = useEntries();

  const { count, startedAt } = useMemo(() => {
    const list = entries ?? [];
    if (list.length === 0)
      return { count: 0, startedAt: null as string | null };
    // listEntries は新しい順。最も古い = 末尾
    const earliest = list[list.length - 1].date;
    return { count: list.length, startedAt: earliest };
  }, [entries]);

  const appVersion =
    (Constants.expoConfig?.version as string | undefined) ?? '0.1.0';

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <View style={[styles.container, { backgroundColor: c.paper.base }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="戻る"
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.4 },
            ]}
          >
            <ChevronLeft size={24} color="$inkPrimary" />
          </Pressable>
          <Text style={[styles.headerTitle, { color: c.ink.primary }]}>
            設定
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing['4xl'],
          }}
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel label="表示" c={c} />
          <View style={[styles.group, { backgroundColor: c.paper.deep }]}>
            {THEME_OPTIONS.map((opt, i) => {
              const selected = mode === opt.mode;
              const isLast = i === THEME_OPTIONS.length - 1;
              return (
                <Pressable
                  key={opt.mode}
                  onPress={() => setMode(opt.mode)}
                  android_ripple={{ color: c.paper.sunken }}
                  style={({ pressed }) => [
                    styles.row,
                    !isLast && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: c.ink.ghost,
                    },
                    pressed && { backgroundColor: c.paper.sunken },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View style={styles.rowMain}>
                    <Text style={[styles.rowLabel, { color: c.ink.primary }]}>
                      {opt.label}
                    </Text>
                    <Text
                      style={[styles.rowDescription, { color: c.ink.muted }]}
                    >
                      {opt.description}
                    </Text>
                  </View>
                  {selected ? (
                    <Check size={20} color="$accent" />
                  ) : (
                    <View style={styles.checkPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <SectionLabel label="記録" c={c} />
          <View style={[styles.group, { backgroundColor: c.paper.deep }]}>
            <InfoRow
              label="書いた日数"
              value={count > 0 ? `${count} 日` : '—'}
              c={c}
              divider
            />
            <InfoRow
              label="はじめた日"
              value={startedAt ? fullDate(startedAt) : '—'}
              c={c}
            />
          </View>

          <SectionLabel label="その他" c={c} />
          <View style={[styles.group, { backgroundColor: c.paper.deep }]}>
            <InfoRow label="バージョン" value={appVersion} c={c} />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function SectionLabel({ label, c }: { label: string; c: ColorScheme }) {
  return (
    <Text style={[styles.sectionLabel, { color: c.ink.muted }]}>{label}</Text>
  );
}

function InfoRow({
  label,
  value,
  c,
  divider,
}: {
  label: string;
  value: string;
  c: ColorScheme;
  divider?: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        divider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: c.ink.ghost,
        },
      ]}
    >
      <Text style={[styles.rowLabel, { color: c.ink.primary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: c.ink.muted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 17,
    marginRight: 32,
  },
  headerRight: {
    width: 32,
  },
  sectionLabel: {
    fontFamily: 'NotoSerifJP',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: spacing['2xl'],
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  group: {
    marginHorizontal: spacing.xl,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowMain: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: 'NotoSerifJP',
    fontSize: 16,
  },
  rowDescription: {
    marginTop: 2,
    fontFamily: 'NotoSerifJP',
    fontSize: 12,
  },
  rowValue: {
    fontFamily: 'NotoSerifJP',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  checkPlaceholder: {
    width: 20,
    height: 20,
  },
});
