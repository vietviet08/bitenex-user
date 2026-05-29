import "../global.css";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import { pushNotificationService, socketClient } from "@/services";
import { getHasRehydrated, useAuthStore } from "@/store/zustand/auth.store";
import {
    startCartActivitySync,
    stopCartActivitySync,
} from "@/store/zustand/cartActivitySync";
import {
    useHasCompletedWalkthrough,
    useOnboardingChecked,
    useOnboardingStore,
} from "@/store/zustand/onboarding.store";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: "(tabs)",
};

function RootLayoutNav() {
    const { isAuthenticated, isInitialized } = useAuth();
    const segments = useSegments();
    const hasBootstrapped = useRef(false);
    const rehydrationCheckRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const hasCompletedWalkthrough = useHasCompletedWalkthrough();
    const isOnboardingChecked = useOnboardingChecked();
    const checkWalkthroughStatus = useOnboardingStore(
        (state) => state.checkWalkthroughStatus,
    );

    useEffect(() => {
        checkWalkthroughStatus();
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
                        10,
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
        if (isAuthenticated) {
            socketClient.connect();
            pushNotificationService.start();
            startCartActivitySync();
        } else {
            socketClient.disconnect();
            pushNotificationService.stop();
            stopCartActivitySync();
        }
        return () => {
            pushNotificationService.stop();
            stopCartActivitySync();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (isInitialized && isOnboardingChecked) {
            SplashScreen.hideAsync();
        }
    }, [isInitialized, isOnboardingChecked]);

    const theme = DefaultTheme;

    if (!isInitialized || !isOnboardingChecked) {
        return (
            <View className="flex-1 justify-center items-center bg-background-primary">
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!hasCompletedWalkthrough && !inOnboardingGroup) {
        return <Redirect href="/(onboarding)/walkthrough" />;
    }

    if (hasCompletedWalkthrough && inOnboardingGroup) {
        if (isAuthenticated) {
            return <Redirect href="/(tabs)" />;
        }
        return <Redirect href="/(auth)/login" />;
    }

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
        return <Redirect href="/(auth)/login" />;
    }

    if (isAuthenticated && inAuthGroup) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <ThemeProvider value={theme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />

                <Stack.Screen
                    name="(onboarding)"
                    options={{
                        headerShown: false,
                        animation: "fade",
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
                    name="restaurant/[id]"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />

                <Stack.Screen
                    name="food/[id]"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />

                <Stack.Screen
                    name="checkout"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />

                <Stack.Screen
                    name="checkout/address-picker"
                    options={{
                        headerShown: false,
                        animation: "slide_from_bottom",
                    }}
                />

                <Stack.Screen
                    name="order/payment-processing"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />

                <Stack.Screen
                    name="payment/result"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />

                <Stack.Screen
                    name="modal"
                    options={{
                        presentation: "modal",
                        title: "Modal",
                    }}
                />

                <Stack.Screen
                    name="restaurant/overview"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />

                <Stack.Screen
                    name="restaurant/reviews"
                    options={{
                        headerShown: false,
                        animation: "slide_from_right",
                    }}
                />
            </Stack>
            <StatusBar style="dark" />
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
