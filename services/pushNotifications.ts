import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

import api from "./api";

const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";
const isPushFeatureEnabled =
    process.env.EXPO_PUBLIC_ENABLE_FIREBASE_PUSH === "true";
type MessagingModule = typeof import("@react-native-firebase/messaging").default;

class PushNotificationService {
    private started = false;
    private tokenRefreshUnsubscribe: (() => void) | null = null;
    private openedAppUnsubscribe: (() => void) | null = null;
    private foregroundUnsubscribe: (() => void) | null = null;
    private hasLoggedUnavailable = false;

    start(): void {
        if (!isNativeMobile || this.started || !this.isMessagingAvailable()) {
            return;
        }

        this.started = true;
        void this.bootstrap();

        const messaging = this.getMessaging();
        if (!messaging) {
            this.started = false;
            return;
        }

        this.tokenRefreshUnsubscribe = messaging().onTokenRefresh((token) => {
            void this.registerToken(token);
        });

        this.openedAppUnsubscribe = messaging().onNotificationOpenedApp(
            (message) => {
                this.handleOpenedNotification(message);
            },
        );

        this.foregroundUnsubscribe = messaging().onMessage(async (message) => {
            console.log("[Push] Foreground message received:", message.messageId);
        });

        void this.handleInitialNotification();
    }

    stop(): void {
        this.tokenRefreshUnsubscribe?.();
        this.openedAppUnsubscribe?.();
        this.foregroundUnsubscribe?.();

        this.tokenRefreshUnsubscribe = null;
        this.openedAppUnsubscribe = null;
        this.foregroundUnsubscribe = null;
        this.started = false;
    }

    async unregisterCurrentDevice(): Promise<void> {
        const messaging = this.getMessaging();
        if (!messaging) {
            return;
        }

        try {
            const token = await messaging().getToken();
            if (!token) {
                return;
            }

            await api.delete(`/notifications/devices/${encodeURIComponent(token)}`);
        } catch (error) {
            console.warn("[Push] Failed to unregister device token", error);
        }
    }

    private async bootstrap(): Promise<void> {
        const messaging = this.getMessaging();
        if (!messaging) {
            return;
        }

        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            console.warn("[Push] Notification permission not granted");
            return;
        }

        try {
            const token = await messaging().getToken();
            await this.registerToken(token);
        } catch (error) {
            console.warn("[Push] Failed to bootstrap Firebase Messaging", error);
        }
    }

    private async requestPermission(): Promise<boolean> {
        const messaging = this.getMessaging();
        if (!messaging) {
            return false;
        }

        await messaging().registerDeviceForRemoteMessages();

        const authorizationStatus = await messaging().requestPermission();
        return (
            authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    }

    private async registerToken(token: string | null): Promise<void> {
        if (!token || !isNativeMobile) {
            return;
        }

        try {
            await api.post("/notifications/devices", {
                token,
                platform: Platform.OS,
            });
        } catch (error) {
            console.warn("[Push] Failed to sync device token with API", error);
        }
    }

    private async handleInitialNotification(): Promise<void> {
        const messaging = this.getMessaging();
        if (!messaging) {
            return;
        }

        const message = await messaging().getInitialNotification();
        this.handleOpenedNotification(message);
    }

    private handleOpenedNotification(
        message: FirebaseMessagingTypes.RemoteMessage | null,
    ): void {
        const deepLink = message?.data?.deepLink;
        if (typeof deepLink === "string" && deepLink.length > 0) {
            void Linking.openURL(deepLink);
        }
    }

    private isMessagingAvailable(): boolean {
        return this.getMessaging() !== null;
    }

    private getMessaging(): MessagingModule | null {
        if (!isNativeMobile || !isPushFeatureEnabled) {
            return null;
        }

        try {
            return require("@react-native-firebase/messaging").default;
        } catch (error) {
            if (!this.hasLoggedUnavailable) {
                this.hasLoggedUnavailable = true;
                console.warn(
                    "[Push] Firebase Messaging native module is unavailable. Rebuild the native app after installing @react-native-firebase/app and @react-native-firebase/messaging.",
                    error,
                );
            }
            return null;
        }
    }
}

export const pushNotificationService = new PushNotificationService();
