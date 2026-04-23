import '../../tamagui-web.css';

import {
  NotoSerifJP_400Regular,
  NotoSerifJP_500Medium,
  NotoSerifJP_600SemiBold,
  NotoSerifJP_700Bold,
} from '@expo-google-fonts/noto-serif-jp';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { TamaguiProvider } from 'tamagui';
import { DatabaseProvider } from '@/lib/database';
import { colors } from '@/theme/colors';
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

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper.base,
    card: colors.paper.base,
    text: colors.ink.primary,
    border: colors.ink.ghost,
    primary: colors.accent.blue,
  },
};

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
        <DatabaseProvider>
          <KeyboardProvider>
            <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
              <PortalProvider>
                <ThemeProvider value={navigationTheme}>
                  <StatusBar style="dark" />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: colors.paper.base },
                    }}
                  />
                </ThemeProvider>
              </PortalProvider>
            </TamaguiProvider>
          </KeyboardProvider>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
