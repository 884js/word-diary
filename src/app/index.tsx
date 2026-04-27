import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiaryHeader } from '@/features/entry/components/DiaryHeader';
import { PromptText } from '@/features/entry/components/PromptText';
import { StackedList } from '@/features/entry/components/StackedList';
import { TodayComposer } from '@/features/entry/components/TodayComposer';
import { UpdateBanner } from '@/features/update/components/UpdateBanner';
import { useColors } from '@/theme/ThemeContext';

export default function Home() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [editingDate, setEditingDate] = useState<string | null>(null);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.paper.base,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        <DiaryHeader />
        <UpdateBanner />
        <PromptText />
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
  },
  scrollContent: {
    paddingBottom: 48,
  },
});
