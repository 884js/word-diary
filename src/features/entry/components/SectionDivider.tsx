import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type Props = {
  label: string;
  /** 年ラベルの下に添える小さなサブラベル（例: "書いた日数 23日"） */
  subLabel?: string;
  variant?: 'month' | 'year';
};

function SectionDividerInner({ label, subLabel, variant = 'month' }: Props) {
  const c = useColors();
  const isYear = variant === 'year';
  return (
    <View style={[styles.wrapper, isYear && styles.wrapperYear]}>
      <View style={styles.row}>
        <View style={[styles.line, { backgroundColor: c.ink.subtle }]} />
        <Text
          style={[
            styles.label,
            { color: c.ink.muted },
            isYear && { ...styles.labelYear, color: c.ink.secondary },
          ]}
        >
          {label}
        </Text>
        <View style={[styles.line, { backgroundColor: c.ink.subtle }]} />
      </View>
      {subLabel ? (
        <Text style={[styles.subLabel, { color: c.ink.muted }]}>
          {subLabel}
        </Text>
      ) : null}
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
  },
  label: {
    fontFamily: 'NotoSerifJP',
    fontSize: 12,
    letterSpacing: 3,
  },
  labelYear: {
    fontSize: 14,
    letterSpacing: 4,
  },
  subLabel: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: 'NotoSerifJP',
    fontSize: 11,
    letterSpacing: 1.5,
  },
});
