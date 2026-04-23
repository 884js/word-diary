import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import migrations from '../../../drizzle/migrations';
import { db } from './client';

type Props = {
  children: ReactNode;
};

/**
 * アプリ起動時にDBマイグレーションを走らせる。
 * 失敗時は最小限のフォールバックUIを表示。
 */
export function DatabaseProvider({ children }: Props) {
  const { success, error } = useMigrations(db, migrations);

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

  if (!success) {
    // スプラッシュ中なので何も出さない
    return null;
  }

  return <>{children}</>;
}

export { db } from './client';
export * from './schema';
