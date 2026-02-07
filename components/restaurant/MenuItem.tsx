import { View, Text, Pressable } from "react-native";
import React, { memo } from "react";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

export type MenuItemData = {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
};

interface MenuItemProps {
    readonly item: MenuItemData;
}

export const MenuItem = memo(function MenuItem({ item }: MenuItemProps) {
    return (
        <View className="flex-row gap-4">
            {/* Info — left side */}
            <View className="flex-1 justify-between">
                <View>
                    <Text className="text-lg font-bold text-neutral-900 leading-snug mb-1">
                        {item.name}
                    </Text>
                    <Text
                        className="text-sm text-neutral-500 leading-relaxed"
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                </View>
                <View className="mt-3">
                    <Text className="text-lg font-bold text-neutral-900">
                        ${item.price.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Image + add button — right side */}
            <View className="relative" style={{ width: 112, height: 112 }}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 12,
                        }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-full h-full rounded-xl bg-neutral-100 items-center justify-center overflow-hidden">
                        <Text className="text-4xl">🍽️</Text>
                    </View>
                )}

                {/* Add button */}
                <Pressable className="absolute -bottom-2 -right-2 bg-white p-1 rounded-lg shadow-md border border-neutral-100">
                    <View
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.primary[500] }}
                    >
                        <IconSymbol name="add" size={20} color="#FFFFFF" />
                    </View>
                </Pressable>
            </View>
        </View>
    );
});
