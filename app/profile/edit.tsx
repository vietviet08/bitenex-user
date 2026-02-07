import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Mock user data
const MOCK_USER = {
    fullName: "Andrew Ainsley",
    nickname: "Andrew",
    email: "andrew_ainsley@yourdomain.com",
    phone: "+1 111 467 378 399",
    gender: "Male",
    dateOfBirth: "12/27/1995",
    avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
};

interface FormFieldProps {
    readonly label: string;
    readonly value: string;
    readonly onChangeText: (text: string) => void;
    readonly placeholder?: string;
    readonly keyboardType?: "default" | "email-address" | "phone-pad";
}

function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
}: FormFieldProps) {
    return (
        <View className="mb-4">
            <Text className="text-sm font-medium text-text-secondary mb-2">
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                className="bg-gray-50 rounded-xl px-4 py-3.5 text-base text-text-primary"
                placeholderTextColor="#9e9e9e"
            />
        </View>
    );
}

export default function EditProfileScreen() {
    const [formData, setFormData] = useState({
        fullName: MOCK_USER.fullName,
        nickname: MOCK_USER.nickname,
        email: MOCK_USER.email,
        phone: MOCK_USER.phone,
        gender: MOCK_USER.gender,
        dateOfBirth: MOCK_USER.dateOfBirth,
    });

    const handleUpdate = () => {
        // Future: API call to update profile
        console.log("Update profile:", formData);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Edit Profile" />

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View className="items-center py-6">
                    <View className="relative">
                        <Image
                            source={{ uri: MOCK_USER.avatarUrl }}
                            style={{ width: 120, height: 120, borderRadius: 60 }}
                            contentFit="cover"
                        />
                        <Pressable className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full items-center justify-center">
                            <IconSymbol name="edit" size={16} color="#ffffff" />
                        </Pressable>
                    </View>
                </View>

                {/* Form */}
                <FormField
                    label="Full Name"
                    value={formData.fullName}
                    onChangeText={(text) =>
                        setFormData({ ...formData, fullName: text })
                    }
                />
                <FormField
                    label="Nickname"
                    value={formData.nickname}
                    onChangeText={(text) =>
                        setFormData({ ...formData, nickname: text })
                    }
                />
                <FormField
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                />
                <FormField
                    label="Phone Number"
                    value={formData.phone}
                    onChangeText={(text) =>
                        setFormData({ ...formData, phone: text })
                    }
                    keyboardType="phone-pad"
                />
                <FormField
                    label="Gender"
                    value={formData.gender}
                    onChangeText={(text) =>
                        setFormData({ ...formData, gender: text })
                    }
                />
                <FormField
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChangeText={(text) =>
                        setFormData({ ...formData, dateOfBirth: text })
                    }
                />

                <View className="h-6" />
            </ScrollView>

            {/* Update Button */}
            <View className="px-6 pb-6">
                <Pressable
                    onPress={handleUpdate}
                    className="bg-primary-500 py-4 rounded-full items-center active:bg-primary-600"
                >
                    <Text className="text-white font-bold text-base">
                        Update
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
