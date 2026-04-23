import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

type Props = {
  label: string;
  variant?: 'month' | 'year' | 'section';
};

function SectionDividerInner({ label, variant = 'month' }: Props) {
  const isYear = variant === 'year';
  const isSection = variant === 'section';
  return (
    <View style={[styles.wrapper, isYear && styles.wrapperYear]}>
      <View style={styles.line} />
      <Text
        style={[
          styles.label,
          isYear && styles.labelYear,
          isSection && styles.labelSection,
        ]}
      >
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

export const SectionDivider = memo(SectionDividerInner);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  wrapperYear: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
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
  labelSection: {
    fontSize: 11,
    letterSpacing: 4,
  },
});
