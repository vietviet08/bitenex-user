import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";
import { formatCurrency } from "@/utils/helpers";

interface FloatingCartBarProps {
    readonly itemCount: number;
    readonly total: number;
}

export function FloatingCartBar({ itemCount, total }: FloatingCartBarProps) {
    const insets = useSafeAreaInsets();

    if (itemCount <= 0) {
        return null;
    }

    return (
        <View
            className="absolute left-0 right-0 bottom-0 z-50"
            pointerEvents="box-none"
        >
            <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.9)", "#FFFFFF"]}
                locations={[0, 0.3, 0.5]}
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 24,
                    paddingBottom: Math.max(insets.bottom, 16) + 16,
                }}
            >
                <Pressable
                    onPress={() => router.push("/(tabs)/cart")}
                    className="w-full rounded-xl p-4 flex-row items-center justify-between"
                    style={{
                        backgroundColor: colors.primary[500],
                        shadowColor: colors.primary[500],
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 20,
                        elevation: 12,
                    }}
                >
                    <View className="flex-row items-center gap-3">
                        <View className="bg-white/20 rounded-lg w-8 h-8 items-center justify-center">
                            <Text className="text-sm font-bold text-white">
                                {itemCount}
                            </Text>
                        </View>
                        <Text className="font-medium text-sm text-white/90">
                            Items in cart
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-white">
                            {formatCurrency(total)}
                        </Text>
                        <IconSymbol
                            name="arrow-forward"
                            size={16}
                            color="#FFFFFF"
                        />
                    </View>
                </Pressable>
            </LinearGradient>
        </View>
    );
}
