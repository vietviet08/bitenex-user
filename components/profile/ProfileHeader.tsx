import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface ProfileHeaderProps {
    readonly avatarUrl: string;
    readonly name: string;
    readonly phone: string;
    readonly onEditPress?: () => void;
}

function ProfileHeaderComponent({
    avatarUrl,
    name,
    phone,
    onEditPress,
}: ProfileHeaderProps) {
    const handleEdit = () => {
        if (onEditPress) {
            onEditPress();
        } else {
            router.push("/profile/edit");
        }
    };

    return (
        <View className="flex-row items-center gap-4 px-6 py-4">
            <View className="relative">
                <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                    contentFit="cover"
                />
            </View>
            <View className="flex-1">
                <Text className="text-xl font-bold text-text-primary mb-1">
                    {name}
                </Text>
                <Text className="text-sm text-text-secondary font-medium">
                    {phone}
                </Text>
            </View>
            <Pressable
                onPress={handleEdit}
                className="p-2 rounded-full active:bg-primary-100"
            >
                <IconSymbol name="edit" size={20} color="#22c55e" />
            </Pressable>
        </View>
    );
}

export const ProfileHeader = memo(ProfileHeaderComponent);
