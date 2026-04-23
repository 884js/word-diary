import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

type Props = {
  label: string;
  /** 年ラベルの下に添える小さなサブラベル（例: "書いた日数 23日"） */
  subLabel?: string;
  variant?: 'month' | 'year';
};

function SectionDividerInner({ label, subLabel, variant = 'month' }: Props) {
  const isYear = variant === 'year';
  return (
    <View style={[styles.wrapper, isYear && styles.wrapperYear]}>
      <View style={styles.row}>
        <View style={styles.line} />
        <Text style={[styles.label, isYear && styles.labelYear]}>{label}</Text>
        <View style={styles.line} />
      </View>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </View>
  );
}

export const SectionDivider = memo(SectionDividerInner);

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  wrapperYear: {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.ink.subtle,
  },
  label: {
    fontFamily: 'NotoSerifJP',
    fontSize: 12,
    letterSpacing: 3,
    color: colors.ink.muted,
  },
  labelYear: {
    fontSize: 14,
    letterSpacing: 4,
    color: colors.ink.secondary,
  },
  subLabel: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: 'NotoSerifJP',
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.ink.muted,
  },
});
