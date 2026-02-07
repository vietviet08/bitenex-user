import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

export function FoodItemHeaderActions() {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute left-0 right-0 z-20 flex-row justify-between px-4"
            style={{ top: insets.top + 8 }}
        >
            {/* Back button */}
            <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                <IconSymbol name="arrow-back" size={24} color={colors.neutral[800]} />
            </Pressable>

            {/* Share button */}
            <Pressable
                onPress={() => {
                    // TODO: Implement share functionality
                }}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                <IconSymbol name="ios-share" size={24} color={colors.neutral[800]} />
            </Pressable>
        </View>
    );
}
