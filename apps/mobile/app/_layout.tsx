import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider } from '@tamagui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import tamaguiConfig from '../src/theme/tamagui.config';
import { AuthProvider } from '../src/auth/AuthContext';

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
