import '../../tamagui-web.css';

import {
  NotoSerifJP_400Regular,
  NotoSerifJP_500Medium,
  NotoSerifJP_600SemiBold,
  NotoSerifJP_700Bold,
} from '@expo-google-fonts/noto-serif-jp';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { TamaguiProvider } from 'tamagui';
import { DatabaseProvider } from '@/lib/database';
import { darkColors, lightColors } from '@/theme/colors';
import { ThemeProvider, useThemeMode } from '@/theme/ThemeContext';
import tamaguiConfig from '../../tamagui.config';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    NotoSerifJP: NotoSerifJP_400Regular,
    NotoSerifJPMedium: NotoSerifJP_500Medium,
    NotoSerifJPSemiBold: NotoSerifJP_600SemiBold,
    NotoSerifJPBold: NotoSerifJP_700Bold,
  });

  // DB の migrations/seed 完了までスプラッシュを残すためのフラグ
  const [dbReady, setDbReady] = useState(false);
  const handleDbReady = useCallback(() => setDbReady(true), []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // フォントと DB の両方が揃ってはじめてスプラッシュを下ろす。
  // こうしないと migrations 実行中の白画面が一瞬見える。
  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedRoot onDbReady={handleDbReady} />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/**
 * テーマ解決後の内側ツリー。
 * Tamagui / Navigation / StatusBar / Stack の色を現在のスキームに合わせる。
 */
function ThemedRoot({ onDbReady }: { onDbReady: () => void }) {
  const { scheme } = useThemeMode();
  const isDark = scheme === 'dark';
  const c = isDark ? darkColors : lightColors;

  const navigationTheme = useMemo(() => {
    const base = isDark ? NavDarkTheme : NavDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: c.paper.base,
        card: c.paper.base,
        text: c.ink.primary,
        border: c.ink.ghost,
        primary: c.accent.blue,
      },
    };
  }, [isDark, c]);

  return (
    <DatabaseProvider onReady={onDbReady}>
      <KeyboardProvider>
        <TamaguiProvider
          config={tamaguiConfig}
          defaultTheme={isDark ? 'dark' : 'light'}
        >
          <PortalProvider>
            <NavigationThemeProvider value={navigationTheme}>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: c.paper.base },
                }}
              />
            </NavigationThemeProvider>
          </PortalProvider>
        </TamaguiProvider>
      </KeyboardProvider>
    </DatabaseProvider>
  );
}
