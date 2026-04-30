import { useEffect } from 'react';
import { useEntries } from '@/features/entry/hooks/useEntries';
import { syncWidgetData } from '@/lib/widgetData';

/**
 * useEntries のキャッシュ変化に追従してホーム画面ウィジェット用のデータを
 * App Group の UserDefaults に書き出す。アプリ起動時・記録時・削除時の
 * すべてで同期されるよう、ツリーの上位で常駐させて使う。
 */
export function WidgetSyncEffect() {
  const { data } = useEntries();
  useEffect(() => {
    if (data) syncWidgetData(data);
  }, [data]);
  return null;
}
