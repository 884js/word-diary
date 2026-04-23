import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { longDate } from '@/lib/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';
import { useUpsertEntry } from '../hooks/useEntries';

type Props = {
  date: string | null;
  onClose: () => void;
};

/**
 * 過去日（未記入日）への追記用モーダル。
 * TodayComposerと同じビジュアルフォーマットで、下から出現。
 */
export function EntryModal({ date, onClose }: Props) {
  const upsert = useUpsertEntry();
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (date) {
      setDraft('');
    }
  }, [date]);

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
    if (!date) return;
    const trimmed = draft.trim();
    if (!trimmed) return;
    await upsert.mutateAsync({ date, word: trimmed });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  };

  return (
    <Modal
      visible={date !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.date}>{date ? longDate(date) : ''}</Text>
          <Text style={styles.prompt}>この日を、ひと言で。</Text>

          <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder=""
              placeholderTextColor={colors.ink.subtle}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              maxLength={80}
              autoFocus
              autoCorrect={false}
            />
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.actionCancel}>閉じる</Text>
            </Pressable>
            <Animated.View
              style={{ opacity: buttonOpacity }}
              pointerEvents={showButton ? 'auto' : 'none'}
            >
              <Pressable
                onPress={handleSubmit}
                disabled={upsert.isPending}
                hitSlop={8}
              >
                <Text style={styles.actionSubmit}>記録する</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 26, 22, 0.25)',
  },
  sheet: {
    backgroundColor: colors.paper.base,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    shadowColor: 'rgba(30, 26, 22, 0.1)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink.subtle,
    marginBottom: spacing.lg,
  },
  date: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 22,
    color: colors.ink.primary,
    letterSpacing: 0.5,
  },
  prompt: {
    marginTop: spacing.xs,
    fontFamily: 'NotoSerifJP',
    fontSize: 14,
    color: colors.ink.muted,
  },
  inputRow: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.ink.subtle,
  },
  inputRowFocused: {
    borderBottomColor: colors.accent.blue,
  },
  input: {
    fontFamily: 'NotoSerifJP',
    fontSize: 20,
    color: colors.ink.primary,
    paddingVertical: spacing.xs,
    padding: 0,
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 24,
  },
  actionCancel: {
    fontFamily: 'NotoSerifJP',
    fontSize: 15,
    color: colors.ink.muted,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionSubmit: {
    fontFamily: 'NotoSerifJPMedium',
    fontSize: 15,
    color: colors.accent.blue,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
