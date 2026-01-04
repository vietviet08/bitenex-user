/**
 * Root Layout
 * Wraps the entire app with providers and navigation config
 */

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store';
import { socketClient } from '@/services';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Navigation settings
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, setInitialized } = useAuthStore();

  useEffect(() => {
    // Initialize app
    async function initializeApp() {
      try {
        // Connect socket if authenticated
        if (isAuthenticated) {
          await socketClient.connect();
        }
      } catch (error) {
        console.warn('[App] Initialization error:', error);
      } finally {
        setInitialized(true);
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();

    // Cleanup on unmount
    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, setInitialized]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Main tabs */}
            <Stack.Screen name="(tabs)" />

            {/* Auth screens (group) */}
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />

            {/* Modal screens */}
            <Stack.Screen
              name="(modal)"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />

            {/* Legacy modal - remove after migration */}
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: 'Modal',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
