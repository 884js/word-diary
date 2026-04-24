import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { type ReactNode, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/theme/ThemeContext';
import migrations from '../../../drizzle/migrations';
import { db } from './client';
import { seedIfEmpty } from './seed';

type Props = {
  children: ReactNode;
  /**
   * DB の初期化が「表示可能な状態」になったとき（成功 or エラー UI 表示可能）に呼ばれる。
   * 呼び出し側でスプラッシュを落とすのに使う。
   */
  onReady?: () => void;
};

/**
 * アプリ起動時にDBマイグレーションを走らせる。
 * 失敗時は最小限のフォールバックUIを表示。
 * 開発時はDBが空なら自動的にサンプルデータを投入（見た目確認用）。
 */
export function DatabaseProvider({ children, onReady }: Props) {
  const c = useColors();
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(!__DEV__);

  useEffect(() => {
    if (!success || seeded) return;
    seedIfEmpty()
      .catch(() => {
        // seed失敗は致命的ではない
      })
      .finally(() => setSeeded(true));
  }, [success, seeded]);

  // 成功 (migrations + seed 完了) か失敗 (error) のいずれかで「描画可能」になる
  const ready = !!error || (success && seeded);
  useEffect(() => {
    if (ready) onReady?.();
  }, [ready, onReady]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          padding: 24,
          backgroundColor: c.paper.base,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: c.status.error, fontSize: 16 }}>
          データベースの初期化に失敗しました
        </Text>
        <Text style={{ color: c.ink.muted, marginTop: 8, fontSize: 13 }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!success || !seeded) {
    // スプラッシュ中なので何も出さない
    return null;
  }

  return <>{children}</>;
}

export { db } from './client';
export * from './schema';
