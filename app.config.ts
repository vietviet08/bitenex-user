import type { ConfigPlugin } from "@expo/config-plugins";
import { AndroidConfig, withAndroidManifest } from "@expo/config-plugins";

const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;
const googleServiceInfoPlist = process.env.GOOGLE_SERVICE_INFO_PLIST;

const FIREBASE_DEFAULT_CHANNEL_METADATA =
    "com.google.firebase.messaging.default_notification_channel_id";

const withFirebaseNotificationChannelIdReplace: ConfigPlugin = (config) =>
    withAndroidManifest(config, (config) => {
        const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        const metadata = application["meta-data"]?.find(
            (item) => item.$?.["android:name"] === FIREBASE_DEFAULT_CHANNEL_METADATA
        );

        if (metadata?.$) {
            const replaceValues = new Set(
                (metadata.$["tools:replace"] ?? "")
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean)
            );

            replaceValues.add("android:value");
            metadata.$["tools:replace"] = Array.from(replaceValues).join(",");
        }

        return config;
    });

export default {
    expo: {
        name: "bitenex-user",
        slug: "bitenex-user",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "bitenexuser",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.anonymous.bitenexuser",
            googleServicesFile: googleServiceInfoPlist,
            infoPlist: {
                UIBackgroundModes: ["remote-notification"],
                NSMicrophoneUsageDescription:
                    "Allow Bitenex to use your microphone for driver voice calls.",
            },
        },
        android: {
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            package: "com.anonymous.bitenexuser",
            googleServicesFile: googleServicesJson,
            permissions: [
                "POST_NOTIFICATIONS",
                "android.permission.RECORD_AUDIO",
                "android.permission.MODIFY_AUDIO_SETTINGS",
            ],
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            "expo-router",
            [
                "expo-notifications",
                {
                    icon: "./assets/images/android-icon-monochrome.png",
                    color: "#FF6B35",
                    defaultChannel: "default",
                },
            ],
            "expo-audio",
            "@react-native-firebase/app",
            "@react-native-firebase/messaging",
            withFirebaseNotificationChannelIdReplace,
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                    dark: {
                        backgroundColor: "#000000",
                    },
                },
            ],
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission:
                        "Allow Bitenex to use your location to show driver tracking and delivery updates.",
                },
            ],
            [
                "@rnmapbox/maps",
                {
                    RNMapboxMapsImpl: "mapbox",
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
    },
};
