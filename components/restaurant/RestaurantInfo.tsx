import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

type PromoTag = {
    id: string;
    icon: "local-shipping" | "local-offer" | "eco";
    text: string;
    variant: "primary" | "red" | "green";
};

interface RestaurantInfoProps {
    readonly name: string;
    readonly rating: number;
    readonly reviewCount: string;
    readonly cuisine: string;
    readonly priceLevel: string;
    readonly deliveryTime: string;
    readonly tags: PromoTag[];
}

const TAG_STYLES = {
    primary: {
        bg: "bg-primary-50/80",
        textColor: colors.primary[500],
    },
    red: {
        bg: "bg-red-50",
        textColor: "#EF4444",
    },
    green: {
        bg: "bg-green-50",
        textColor: "#16A34A",
    },
} as const;

export function RestaurantInfo({
    name,
    rating,
    reviewCount,
    cuisine,
    priceLevel,
    deliveryTime,
    tags,
}: RestaurantInfoProps) {
    return (
        <View className="mb-6">
            {/* Title + Time box + Info button */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-3">
                    <Text className="text-3xl font-extrabold text-neutral-900 leading-tight">
                        {name}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Pressable
                        onPress={() => router.push("/restaurant/overview")}
                        className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center"
                    >
                        <IconSymbol
                            name="info"
                            size={20}
                            color={colors.neutral[600]}
                        />
                    </Pressable>
                    <View className="items-center justify-center bg-white p-2 rounded-xl shadow-sm border border-neutral-100">
                        <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                            Time
                        </Text>
                        <Text className="text-sm font-bold text-neutral-900">
                            {deliveryTime}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Rating row - tappable to go to reviews */}
            <Pressable
                onPress={() => router.push("/restaurant/reviews")}
                className="flex-row items-center flex-wrap gap-y-2 mb-4"
            >
                <View className="flex-row items-center gap-1 mr-4">
                    <IconSymbol
                        name="star"
                        size={20}
                        color={colors.primary[500]}
                    />
                    <Text className="font-bold text-neutral-900 text-base">
                        {rating}
                    </Text>
                    <Text className="text-primary-500 underline">
                        ({reviewCount})
                    </Text>
                    <IconSymbol
                        name="chevron-right"
                        size={16}
                        color={colors.primary[500]}
                    />
                </View>
                <Text className="text-neutral-400 mr-4">•</Text>
                <Text className="text-sm text-neutral-500 mr-4">{cuisine}</Text>
                <Text className="text-neutral-400 mr-4">•</Text>
                <Text className="text-sm text-neutral-500">{priceLevel}</Text>
            </Pressable>

            {/* Promo tags */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
            >
                {tags.map((tag) => {
                    const style = TAG_STYLES[tag.variant];
                    return (
                        <View
                            key={tag.id}
                            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg ${style.bg}`}
                        >
                            <IconSymbol
                                name={tag.icon}
                                size={14}
                                color={style.textColor}
                            />
                            <Text
                                className="text-xs font-bold"
                                style={{ color: style.textColor }}
                            >
                                {tag.text}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

export type { PromoTag };
