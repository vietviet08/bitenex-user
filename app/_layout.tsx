import "../global.css";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { socketClient } from "@/services";
import { getHasRehydrated, useAuthStore } from "@/store/zustand/auth.store";
import { useOnboardingStore } from "@/store/zustand/onboarding.store";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: "(tabs)",
};

function RootLayoutNav() {
    const { isAuthenticated, isInitialized } = useAuth();
    const {
        hasCompletedWalkthrough,
        isChecking,
        isReady,
        checkWalkthroughStatus,
    } = useOnboardingStore();
    const segments = useSegments();
    const colorScheme = useColorScheme();
    const hasBootstrapped = useRef(false);
    const rehydrationCheckRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const hasCheckedWalkthrough = useRef(false);
    const checkWalkthroughStatusRef = useRef(checkWalkthroughStatus);

    useEffect(() => {
        checkWalkthroughStatusRef.current = checkWalkthroughStatus;
    }, [checkWalkthroughStatus]);

    useEffect(() => {
        if (!hasBootstrapped.current && !isInitialized) {
            const checkAndBootstrap = () => {
                if (getHasRehydrated() && !hasBootstrapped.current) {
                    hasBootstrapped.current = true;
                    useAuthStore.getState().bootstrap();
                } else if (!hasBootstrapped.current) {
                    rehydrationCheckRef.current = setTimeout(
                        checkAndBootstrap,
                        10
                    );
                }
            };

            queueMicrotask(checkAndBootstrap);
        }

        return () => {
            if (rehydrationCheckRef.current) {
                clearTimeout(rehydrationCheckRef.current);
            }
        };
    }, [isInitialized]);

    useEffect(() => {
        if (isInitialized && !hasCheckedWalkthrough.current) {
            hasCheckedWalkthrough.current = true;
            if (!hasCompletedWalkthrough) {
                checkWalkthroughStatusRef.current();
            }
        }
    }, [isInitialized, hasCompletedWalkthrough]);

    useEffect(() => {
        if (isAuthenticated) {
            socketClient.connect();
        } else {
            socketClient.disconnect();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isInitialized) {
            SplashScreen.hideAsync();
        }
    }, [isInitialized]);

    const theme = useMemo(
        () => (colorScheme === "dark" ? DarkTheme : DefaultTheme),
        [colorScheme]
    );

    if (!isInitialized || !isReady || isChecking) {
        return (
            <View className="flex-1 justify-center items-center bg-background-primary">
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inAuthGroup = segments[0] === "(auth)";

    if (!hasCompletedWalkthrough && !inOnboardingGroup) {
        return <Redirect href="/(onboarding)/walkthrough" />;
    }

    if (hasCompletedWalkthrough) {
        if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
            return <Redirect href="/(auth)/login" />;
        }
        if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
            return <Redirect href="/(tabs)" />;
        }
    }

    return (
        <ThemeProvider value={theme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />

                <Stack.Screen
                    name="(onboarding)"
                    options={{
                        headerShown: false,
                        animation: "none",
                    }}
                />

                <Stack.Screen
                    name="(auth)"
                    options={{
                        headerShown: false,
                        animation: "slide_from_bottom",
                    }}
                />

                <Stack.Screen
                    name="(modal)"
                    options={{
                        presentation: "modal",
                        animation: "slide_from_bottom",
                    }}
                />

                <Stack.Screen
                    name="modal"
                    options={{
                        presentation: "modal",
                        title: "Modal",
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
