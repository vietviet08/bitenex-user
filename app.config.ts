const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;
const googleServiceInfoPlist = process.env.GOOGLE_SERVICE_INFO_PLIST;

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
            permissions: ["POST_NOTIFICATIONS"],
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
            "@react-native-firebase/app",
            "@react-native-firebase/messaging",
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
