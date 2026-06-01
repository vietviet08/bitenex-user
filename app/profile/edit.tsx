import React, { useState } from "react";
import { ActivityIndicator, Alert, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services";

interface FormFieldProps {
    readonly label: string;
    readonly value: string;
    readonly onChangeText: (text: string) => void;
    readonly placeholder?: string;
    readonly keyboardType?: "default" | "email-address" | "phone-pad";
    readonly editable?: boolean;
}

function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    editable = true,
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
                editable={editable}
                className={`rounded-xl px-4 py-3.5 text-base text-text-primary ${
                    editable ? "bg-gray-50" : "bg-gray-100 text-gray-400"
                }`}
                placeholderTextColor="#9e9e9e"
            />
        </View>
    );
}

export default function EditProfileScreen() {
    const { user, updateUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user?.full_name ?? "",
        nickname: user?.full_name?.split(" ")[0] ?? "User",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        gender: "Male",
        dateOfBirth: "12/27/1995",
    });

    const handleUpdate = async () => {
        if (!formData.fullName.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập họ và tên.");
            return;
        }

        setIsUpdating(true);
        try {
            const response = await api.patch("/users/profile", {
                full_name: formData.fullName.trim(),
                phone: formData.phone.trim() || null,
            });

            // Sync Zustand Store
            updateUser({
                full_name: response.data.full_name,
                phone: response.data.phone,
                avatar_url: response.data.avatar_url,
            });

            Alert.alert("Thành công", "Thông tin hồ sơ đã được cập nhật.");
        } catch (error) {
            console.error("Profile update error:", error);
            Alert.alert("Thất bại", "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
        } finally {
            setIsUpdating(false);
        }
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
                            source={{ uri: user?.avatar_url ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }}
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
                    editable={!isUpdating}
                />
                <FormField
                    label="Nickname"
                    value={formData.nickname}
                    onChangeText={(text) =>
                        setFormData({ ...formData, nickname: text })
                    }
                    editable={!isUpdating}
                />
                <FormField
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                    editable={false}
                />
                <FormField
                    label="Phone Number"
                    value={formData.phone}
                    onChangeText={(text) =>
                        setFormData({ ...formData, phone: text })
                    }
                    keyboardType="phone-pad"
                    editable={!isUpdating}
                />
                <FormField
                    label="Gender"
                    value={formData.gender}
                    onChangeText={(text) =>
                        setFormData({ ...formData, gender: text })
                    }
                    editable={!isUpdating}
                />
                <FormField
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChangeText={(text) =>
                        setFormData({ ...formData, dateOfBirth: text })
                    }
                    editable={!isUpdating}
                />

                <View className="h-6" />
            </ScrollView>

            {/* Update Button */}
            <View className="px-6 pb-6">
                <Pressable
                    onPress={handleUpdate}
                    disabled={isUpdating}
                    className={`bg-primary-500 py-4 rounded-full items-center active:bg-primary-600 ${
                        isUpdating ? "opacity-60" : ""
                    }`}
                >
                    {isUpdating ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <Text className="text-white font-bold text-base">
                            Update
                        </Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
