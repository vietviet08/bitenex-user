import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenHeader, RadioSelector } from "@/components/profile";

const LANGUAGES = [
    { id: "en-us", label: "English (US)" },
    { id: "en-uk", label: "English (UK)" },
    { id: "vi", label: "Tiếng Việt" },
    { id: "ja", label: "日本語" },
    { id: "ko", label: "한국어" },
    { id: "zh", label: "中文" },
    { id: "es", label: "Español" },
    { id: "fr", label: "Français" },
    { id: "de", label: "Deutsch" },
    { id: "pt", label: "Português" },
];

export default function LanguageScreen() {
    const [selectedLanguage, setSelectedLanguage] = useState("en-us");

    const handleSave = () => {
        // Future: save language preference
        console.log("Save language:", selectedLanguage);
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Language" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <View className="py-2">
                    <RadioSelector
                        options={LANGUAGES}
                        selectedId={selectedLanguage}
                        onSelect={setSelectedLanguage}
                    />
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="px-6 pb-6">
                <Pressable
                    onPress={handleSave}
                    className="bg-primary-500 py-4 rounded-full items-center active:bg-primary-600"
                >
                    <Text className="text-white font-bold text-base">
                        Save Changes
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
