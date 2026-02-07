import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

export function RestaurantHeaderActions() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute left-0 right-0 flex-row justify-between items-center px-4"
            style={{ top: insets.top + 8, zIndex: 40 }}
        >
            {/* Back button */}
            <Pressable
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
                onPress={() => router.back()}
            >
                <IconSymbol
                    name="arrow-back"
                    size={22}
                    color={colors.neutral[800]}
                />
            </Pressable>

            {/* Right actions */}
            <View className="flex-row gap-3">
                <Pressable className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm">
                    <IconSymbol
                        name="search"
                        size={22}
                        color={colors.neutral[800]}
                    />
                </Pressable>
                <Pressable className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm">
                    <IconSymbol
                        name="ios-share"
                        size={22}
                        color={colors.neutral[800]}
                    />
                </Pressable>
            </View>
        </View>
    );
}
