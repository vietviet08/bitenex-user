import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { socketClient } from '@/services';
import { colors } from '@/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Navigation settings
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const { isAuthenticated, isInitialized, isLoading, bootstrap } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  // Bootstrap auth on app start
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      socketClient.connect();
    } else {
      socketClient.disconnect();
    }
  }, [isAuthenticated]);

  // Hide splash screen when initialized
  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  // Show loading screen while bootstrapping
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  // Route guard: check if user is in auth group
  const inAuthGroup = segments[0] === '(auth)';

  // Redirect logic
  if (!isAuthenticated && !inAuthGroup) {
    // User is not signed in and not on auth screen -> redirect to login
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated && inAuthGroup) {
    // User is signed in but on auth screen -> redirect to home
    return <Redirect href="/(tabs)" />;
  }

  return (
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
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
