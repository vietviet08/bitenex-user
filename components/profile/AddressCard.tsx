import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface AddressCardProps {
    readonly id: string;
    readonly label: string;
    readonly address: string;
    readonly isDefault?: boolean;
    readonly onPress?: (id: string) => void;
    readonly onEdit?: (id: string) => void;
    readonly onDelete?: (id: string) => void;
}

function AddressCardComponent({
    id,
    label,
    address,
    isDefault = false,
    onPress,
    onEdit,
    onDelete,
}: AddressCardProps) {
    return (
        <Pressable
            onPress={() => onPress?.(id)}
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
            <View className="flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                    <IconSymbol name="location-on" size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-bold text-base text-text-primary">
                            {label}
                        </Text>
                        {isDefault && (
                            <View className="px-2 py-0.5 bg-primary-100 rounded-full">
                                <Text className="text-xs font-semibold text-primary-500">
                                    Default
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text
                        className="text-sm text-text-secondary leading-5"
                        numberOfLines={2}
                    >
                        {address}
                    </Text>
                </View>
            </View>
            <View className="flex-row justify-end gap-2 mt-3">
                <Pressable
                    onPress={() => onEdit?.(id)}
                    className="px-4 py-2 rounded-full bg-gray-100 active:bg-gray-200"
                >
                    <Text className="text-sm font-semibold text-text-primary">
                        Edit
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => onDelete?.(id)}
                    className="px-4 py-2 rounded-full bg-red-50 active:bg-red-100"
                >
                    <Text className="text-sm font-semibold text-red-500">
                        Delete
                    </Text>
                </Pressable>
            </View>
        </Pressable>
    );
}

export const AddressCard = memo(AddressCardComponent);
