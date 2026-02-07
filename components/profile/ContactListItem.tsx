import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";

interface ContactListItemProps {
    readonly id: string;
    readonly name: string;
    readonly phone: string;
    readonly avatarUrl?: string;
    readonly isInvited?: boolean;
    readonly onInvite?: (id: string) => void;
}

function ContactListItemComponent({
    id,
    name,
    phone,
    avatarUrl,
    isInvited = false,
    onInvite,
}: ContactListItemProps) {
    return (
        <View className="flex-row items-center gap-4 py-3 px-4">
            {avatarUrl ? (
                <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    contentFit="cover"
                />
            ) : (
                <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                    <Text className="text-lg font-bold text-gray-500">
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View className="flex-1">
                <Text className="font-semibold text-[15px] text-text-primary">
                    {name}
                </Text>
                <Text className="text-sm text-text-secondary mt-0.5">
                    {phone}
                </Text>
            </View>
            <Pressable
                onPress={() => onInvite?.(id)}
                disabled={isInvited}
                className={`px-4 py-2 rounded-full ${isInvited
                        ? "bg-gray-100"
                        : "bg-primary-500 active:bg-primary-600"
                    }`}
            >
                <Text
                    className={`text-sm font-semibold ${isInvited ? "text-text-secondary" : "text-white"
                        }`}
                >
                    {isInvited ? "Invited" : "Invite"}
                </Text>
            </Pressable>
        </View>
    );
}

export const ContactListItem = memo(ContactListItemComponent);
