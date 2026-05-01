import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider } from '@tamagui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import tamaguiConfig from '../src/theme/tamagui.config';
import { AuthProvider } from '../src/auth/AuthContext';

// ── Storybook toggle ──────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_STORYBOOK=true when starting Metro to load Storybook instead
// of the app.  Metro evaluates process.env at bundle time, so dead code
// (including story requires) is excluded from production builds automatically.
const IS_STORYBOOK = process.env.EXPO_PUBLIC_STORYBOOK === 'true';

// The conditional require keeps story files out of the production bundle.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StorybookUI: React.ComponentType | null = IS_STORYBOOK
  ? require('../.storybook/index').default
  : null;
// ─────────────────────────────────────────────────────────────────────────────

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Storybook mode: render StorybookUI wrapped in required native providers
  if (IS_STORYBOOK && StorybookUI) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StorybookUI />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </QueryClientProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
