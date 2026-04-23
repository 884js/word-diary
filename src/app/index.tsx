import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryModal } from '@/features/entry/components/EntryModal';
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TodayComposer />
        <StackedList onPressEmptyDate={setEditingDate} />
      </ScrollView>
      <EntryModal date={editingDate} onClose={() => setEditingDate(null)} />
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
