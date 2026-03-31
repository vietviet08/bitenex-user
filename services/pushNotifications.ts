import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { NativeModules, Platform } from "react-native";

import api from "./api";

const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";
const isPushFeatureEnabled =
    process.env.EXPO_PUBLIC_ENABLE_FIREBASE_PUSH === "true";
type MessagingModule = typeof import("@react-native-firebase/messaging").default;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

class PushNotificationService {
    private started = false;
    private tokenRefreshUnsubscribe: (() => void) | null = null;
    private openedAppUnsubscribe: (() => void) | null = null;
    private foregroundUnsubscribe: (() => void) | null = null;
    private notificationResponseSubscription: Notifications.EventSubscription | null =
        null;
    private hasLoggedUnavailable = false;

    start(): void {
        if (!isNativeMobile || this.started || !this.isMessagingAvailable()) {
            return;
        }

        this.started = true;
        void this.bootstrap();
        void this.ensureNotificationChannel();

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

        this.notificationResponseSubscription =
            Notifications.addNotificationResponseReceivedListener((response) => {
                const deepLink =
                    response.notification.request.content.data?.deepLink;
                if (typeof deepLink === "string" && deepLink.length > 0) {
                    void Linking.openURL(deepLink);
                }
            });

        this.foregroundUnsubscribe = messaging().onMessage(async (message) => {
            const title = message.notification?.title ?? "Bitenex";
            const body = message.notification?.body ?? "Bạn có thông báo mới.";

            console.log("[Push] Foreground message received:", {
                messageId: message.messageId,
                title,
                body,
                data: message.data,
            });

            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                    data: {
                        ...message.data,
                    },
                },
                trigger: null,
            });
        });

        void this.handleInitialNotification();
    }

    stop(): void {
        this.tokenRefreshUnsubscribe?.();
        this.openedAppUnsubscribe?.();
        this.foregroundUnsubscribe?.();
        this.notificationResponseSubscription?.remove();

        this.tokenRefreshUnsubscribe = null;
        this.openedAppUnsubscribe = null;
        this.foregroundUnsubscribe = null;
        this.notificationResponseSubscription = null;
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

    private async ensureNotificationChannel(): Promise<void> {
        if (Platform.OS !== "android") {
            return;
        }

        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF6B35",
        });
    }

    private isMessagingAvailable(): boolean {
        return this.getMessaging() !== null;
    }

    private getMessaging(): MessagingModule | null {
        if (!isNativeMobile || !isPushFeatureEnabled) {
            return null;
        }

        const nativeModules = NativeModules as Record<string, unknown>;
        if (!nativeModules.RNFBAppModule) {
            if (!this.hasLoggedUnavailable) {
                this.hasLoggedUnavailable = true;
                console.warn(
                    "[Push] Firebase Messaging native module is unavailable. Install the latest development build on this device.",
                );
            }
            return null;
        }

        try {
            const messagingModule = require("@react-native-firebase/messaging");
            const messaging = messagingModule?.default;

            if (typeof messaging !== "function") {
                throw new Error("Firebase Messaging JS module is not ready");
            }

            return messaging;
        } catch (error) {
            if (!this.hasLoggedUnavailable) {
                this.hasLoggedUnavailable = true;
                console.warn(
                    `[Push] Firebase Messaging native module is unavailable: ${String(error)}`,
                );
            }
            return null;
        }
    }
}

export const pushNotificationService = new PushNotificationService();
