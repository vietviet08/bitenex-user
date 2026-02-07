import { View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

interface FoodItemHeroProps {
    readonly imageUrl?: string;
}

export function FoodItemHero({ imageUrl }: FoodItemHeroProps) {
    return (
        <View className="relative w-full shrink-0" style={{ height: 320 }}>
            {/* Image or placeholder */}
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                />
            ) : (
                <View className="w-full h-full bg-neutral-200 items-center justify-center">
                    <Text className="text-7xl">🍔</Text>
                </View>
            )}
        </View>
    );
}
