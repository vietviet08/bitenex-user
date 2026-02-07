import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

export function CartHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-white border-b border-neutral-100 px-4 pb-4"
            style={{ paddingTop: insets.top + 8 }}
        >
            <View className="flex-row items-center">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-3"
                >
                    <IconSymbol
                        name="arrow-back"
                        size={24}
                        color={colors.neutral[800]}
                    />
                </Pressable>
                <Text className="text-xl font-bold text-neutral-900">
                    My Cart
                </Text>
            </View>
        </View>
    );
}
