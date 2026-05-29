import { View, Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { colors } from "@/theme";

interface MenuCategoryTabsProps {
    readonly categories: string[];
    readonly activeIndex: number;
    readonly onSelect: (index: number) => void;
}

export function MenuCategoryTabs({
    categories,
    activeIndex,
    onSelect,
}: MenuCategoryTabsProps) {
    return (
        <View className="py-2 border-b border-neutral-200 shadow-sm bg-neutral-50">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }}
            >
                {categories.map((category, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <Pressable
                            key={category}
                            onPress={() => onSelect(index)}
                            className="items-center gap-1"
                        >
                            <Text
                                className={`text-base px-1 ${
                                    isActive ? "font-bold" : "font-medium"
                                }`}
                                style={{
                                    color: isActive
                                        ? colors.primary[500]
                                        : colors.neutral[500],
                                }}
                            >
                                {category}
                            </Text>
                            <View
                                className="w-full h-1 rounded-full"
                                style={{
                                    backgroundColor: isActive
                                        ? colors.primary[500]
                                        : "transparent",
                                }}
                            />
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}
