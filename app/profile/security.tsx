import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader, ToggleSwitch, SettingsMenuItem } from "@/components/profile";

export default function SecurityScreen() {
    const [settings, setSettings] = useState({
        rememberMe: true,
        faceId: false,
        biometric: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChangePin = () => {
        // Future: navigate to change PIN screen
        console.log("Change PIN");
    };

    const handleChangePassword = () => {
        // Future: navigate to change password screen
        console.log("Change Password");
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Security" />

            <ScrollView
                className="flex-1 px-2"
                showsVerticalScrollIndicator={false}
            >
                <View className="py-2">
                    <ToggleSwitch
                        label="Remember Me"
                        sublabel="Save your login credentials"
                        value={settings.rememberMe}
                        onValueChange={() => handleToggle("rememberMe")}
                    />

                    <ToggleSwitch
                        label="Face ID"
                        sublabel="Use Face ID for quick login"
                        value={settings.faceId}
                        onValueChange={() => handleToggle("faceId")}
                    />

                    <ToggleSwitch
                        label="Biometric ID"
                        sublabel="Use fingerprint for authentication"
                        value={settings.biometric}
                        onValueChange={() => handleToggle("biometric")}
                    />

                    <View className="h-6" />

                    <View className="px-2">
                        <SettingsMenuItem
                            icon="security"
                            label="Change PIN"
                            onPress={handleChangePin}
                        />

                        <SettingsMenuItem
                            icon="security"
                            label="Change Password"
                            onPress={handleChangePassword}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
