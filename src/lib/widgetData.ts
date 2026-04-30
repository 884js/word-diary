import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';
import type { Entry } from '@/lib/database/schema';
import { todayKey, weekdayKind } from './dateUtils';

const APP_GROUP_ID = 'group.com.uki884.worddiary';
const WIDGET_DATA_KEY = 'widgetData';

// ExtensionStorage は iOS の App Group ベース。Android では存在しないので null。
const storage =
  Platform.OS === 'ios' ? new ExtensionStorage(APP_GROUP_ID) : null;

type WidgetEntryPayload = {
  date: string;
  word: string;
  kind: 'weekday' | 'saturday' | 'sunday' | 'holiday';
};

type WidgetDataPayload = {
  totalCount: number;
  today: string;
  todayKind: 'weekday' | 'saturday' | 'sunday' | 'holiday';
  entries: WidgetEntryPayload[];
};

/**
 * ホーム画面ウィジェット用の最新データを App Group の UserDefaults に書き出し、
 * Widget の reload を促す。書き込みは iOS 専用。
 */
export function syncWidgetData(allEntries: Entry[]): void {
  if (!storage) return;

  const sorted = [...allEntries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const recent = sorted.slice(0, 7).map<WidgetEntryPayload>((e) => ({
    date: e.date,
    word: e.word,
    kind: weekdayKind(e.date),
  }));

  const today = todayKey();
  const payload: WidgetDataPayload = {
    totalCount: allEntries.length,
    today,
    todayKind: weekdayKind(today),
    entries: recent,
  };

  storage.set(WIDGET_DATA_KEY, JSON.stringify(payload));
  // Small / Large 両方をリロードするため引数なしで全 Widget を更新する。
  ExtensionStorage.reloadWidget();
}
