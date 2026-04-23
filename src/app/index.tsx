import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackedList } from '@/features/entry/components/StackedList';
import { TodayComposer } from '@/features/entry/components/TodayComposer';
import { colors } from '@/theme/colors';

export default function Home() {
  const insets = useSafeAreaInsets();
  const [editingDate, setEditingDate] = useState<string | null>(null);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        <TodayComposer />
        <StackedList
          editingDate={editingDate}
          onStartEdit={setEditingDate}
          onEndEdit={() => setEditingDate(null)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper.base,
  },
  scrollContent: {
    paddingBottom: 48,
  },
});
