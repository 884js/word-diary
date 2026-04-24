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
import { useEffect, useMemo } from 'react';
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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedRoot />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/**
 * テーマ解決後の内側ツリー。
 * Tamagui / Navigation / StatusBar / Stack の色を現在のスキームに合わせる。
 */
function ThemedRoot() {
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
    <DatabaseProvider>
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
