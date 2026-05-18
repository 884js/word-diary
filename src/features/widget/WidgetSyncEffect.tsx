import { useEffect } from 'react';
import { useEntries } from '@/features/entry/hooks/useEntries';
import { useToday } from '@/lib/hooks/useToday';
import { syncWidgetData } from '@/lib/widgetData';

/**
 * useEntries のキャッシュ変化に追従してホーム画面ウィジェット用のデータを
 * App Group の UserDefaults に書き出す。アプリ起動時・記録時・削除時の
 * すべてで同期されるよう、ツリーの上位で常駐させて使う。
 *
 * useToday も依存に入れて、0:00 跨ぎや AppState 復帰で today が変わった
 * タイミングでも再 sync する（祝日窓を前進させるため）。
 */
export function WidgetSyncEffect() {
  const { data } = useEntries();
  const today = useToday();
  useEffect(() => {
    if (data) syncWidgetData(data, today);
  }, [data, today]);
  return null;
}
