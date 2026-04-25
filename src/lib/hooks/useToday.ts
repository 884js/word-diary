import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { todayKey } from '@/lib/dateUtils';

/**
 * 現在の日付キー(YYYY-MM-DD)を返すフック。
 *
 * 日付変更を検知する 2 層の仕組み:
 * - フォアグラウンド復帰時に AppState.change('active') で再評価
 * - 起動したままでも次の 0:00 の setTimeout で再評価し、発火後に次の 0:00 を再スケジュール
 *
 * setState は前回値との比較で変化があるときだけ走らせ、無駄な再描画を避ける。
 */
export function useToday(): string {
  const [today, setToday] = useState(todayKey);

  useEffect(() => {
    const update = () => {
      const next = todayKey();
      setToday((prev) => (prev === next ? prev : next));
    };

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });

    let timer: ReturnType<typeof setTimeout>;
    const scheduleMidnight = () => {
      const now = new Date();
      // 1 秒ずらしておくことで、稀に setTimeout が早発火しても翌日扱いになる
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      timer = setTimeout(() => {
        update();
        scheduleMidnight();
      }, next.getTime() - now.getTime());
    };
    scheduleMidnight();

    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, []);

  return today;
}
