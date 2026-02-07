import { View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

interface RestaurantHeroProps {
    readonly imageUrl?: string;
}

export function RestaurantHero({ imageUrl }: RestaurantHeroProps) {
    return (
        <View className="relative w-full shrink-0" style={{ height: 320 }}>
            {/* Gradient overlay — from transparent top to black/60 bottom */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)"]}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                }}
            />

            {/* Image or placeholder */}
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                />
            ) : (
                <View className="w-full h-full bg-neutral-200 items-center justify-center">
                    <Text className="text-7xl">🍜</Text>
                </View>
            )}
        </View>
    );
}
