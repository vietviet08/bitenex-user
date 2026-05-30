import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { NativeModules, Platform } from "react-native";

import { api } from "./api";

const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";
const isExpoGo = Constants.appOwnership === "expo";
const isPushFeatureEnabled =
    process.env.EXPO_PUBLIC_ENABLE_FIREBASE_PUSH === "true";
type MessagingModule = typeof import("@react-native-firebase/messaging").default;
type NotificationsModule = typeof import("expo-notifications");
type NotificationSubscription = { remove: () => void };

class PushNotificationService {
    private started = false;
    private tokenRefreshUnsubscribe: (() => void) | null = null;
    private openedAppUnsubscribe: (() => void) | null = null;
    private foregroundUnsubscribe: (() => void) | null = null;
    private notificationResponseSubscription: NotificationSubscription | null =
        null;
    private hasLoggedUnavailable = false;
    private notificationHandlerConfigured = false;

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

        const notifications = this.getNotifications();
        if (notifications) {
            this.notificationResponseSubscription =
                notifications.addNotificationResponseReceivedListener((response) => {
                const deepLink =
                    response.notification.request.content.data?.deepLink;
                if (typeof deepLink === "string" && deepLink.length > 0) {
                    void Linking.openURL(deepLink);
                }
            });
        }

        this.foregroundUnsubscribe = messaging().onMessage(async (message) => {
            const title = message.notification?.title ?? "Bitenex";
            const body = message.notification?.body ?? "Bạn có thông báo mới.";

            const foregroundNotifications = this.getNotifications();

            console.log("[Push] Foreground message received:", {
                messageId: message.messageId,
                title,
                body,
                data: message.data,
            });

            if (!foregroundNotifications) {
                return;
            }

            await foregroundNotifications.scheduleNotificationAsync({
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

        const notifications = this.getNotifications();
        if (!notifications) {
            return;
        }

        await notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF6B35",
        });
    }

    private isMessagingAvailable(): boolean {
        return this.getMessaging() !== null;
    }

    private getMessaging(): MessagingModule | null {
        if (!isNativeMobile || !isPushFeatureEnabled || isExpoGo) {
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
            // eslint-disable-next-line @typescript-eslint/no-require-imports
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

    private getNotifications(): NotificationsModule | null {
        if (!isNativeMobile || isExpoGo) {
            return null;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const notifications = require("expo-notifications") as NotificationsModule;

            if (!this.notificationHandlerConfigured) {
                notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldPlaySound: true,
                        shouldSetBadge: false,
                    }),
                });
                this.notificationHandlerConfigured = true;
            }

            return notifications;
        } catch (error) {
            if (!this.hasLoggedUnavailable) {
                this.hasLoggedUnavailable = true;
                console.warn(
                    `[Push] Expo notifications are unavailable: ${String(error)}`,
                );
            }
            return null;
        }
    }
}

export const pushNotificationService = new PushNotificationService();
