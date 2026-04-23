import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { type ReactNode, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import migrations from '../../../drizzle/migrations';
import { db } from './client';
import { seedIfEmpty } from './seed';

type Props = {
  children: ReactNode;
};

/**
 * アプリ起動時にDBマイグレーションを走らせる。
 * 失敗時は最小限のフォールバックUIを表示。
 * 開発時はDBが空なら自動的にサンプルデータを投入（見た目確認用）。
 */
export function DatabaseProvider({ children }: Props) {
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

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          padding: 24,
          backgroundColor: colors.paper.base,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.status.error, fontSize: 16 }}>
          データベースの初期化に失敗しました
        </Text>
        <Text style={{ color: colors.ink.muted, marginTop: 8, fontSize: 13 }}>
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
