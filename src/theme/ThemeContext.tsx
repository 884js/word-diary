import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { type ColorScheme, darkColors, lightColors } from './colors';

/**
 * ユーザーが選べるテーマモード。
 * - 'system': OSの設定に従う
 * - 'light': 常にライト
 * - 'dark': 常にダーク
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * 実際に画面に適用される解決済みのスキーム。
 * ThemeMode='system'のときにOSから決まる。
 */
export type ResolvedScheme = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: ResolvedScheme;
  colors: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  ready: boolean;
};

const STORAGE_KEY = 'word-diary.theme-mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(v: unknown): v is ThemeMode {
  return v === 'system' || v === 'light' || v === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && isThemeMode(stored)) {
          setModeState(stored);
        }
      } catch {
        // 読み込み失敗時はデフォルトの'system'のまま
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // 保存失敗は握りつぶす（次回起動時に'system'に戻るだけ）
    });
  }, []);

  const scheme: ResolvedScheme = useMemo(() => {
    if (mode === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return mode;
  }, [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      setMode,
      ready,
    }),
    [mode, scheme, setMode, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

/**
 * 現在の解決済みカラーパレットを取得するフック。
 * コンポーネント内で `const c = useColors();` のように使う。
 */
export function useColors(): ColorScheme {
  return useTheme().colors;
}

/**
 * テーマモードとその変更関数を取得するフック。
 * 設定画面などで使用。
 */
export function useThemeMode(): {
  mode: ThemeMode;
  scheme: ResolvedScheme;
  setMode: (mode: ThemeMode) => void;
} {
  const { mode, scheme, setMode } = useTheme();
  return { mode, scheme, setMode };
}
