import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUnreadCount } from "@/store/zustand/notification.store";
import { colors } from "@/theme";

export function HomeHeader() {
    const unreadCount = useUnreadCount();

    return (
        <View className="flex-row items-center justify-between bg-white px-4 py-3">
            <View className="flex-1">
                <Text className="mb-0.5 text-xs text-neutral-500">
                    Delivering to
                </Text>
                <Pressable className="flex-row items-center">
                    <IconSymbol
                        name="location-on"
                        size={18}
                        color={colors.primary[500]}
                    />
                    <Text className="ml-1 text-base font-bold text-neutral-900">
                        Home - 123 Main St
                    </Text>
                    <IconSymbol
                        name="expand-more"
                        size={18}
                        color={colors.neutral[500]}
                    />
                </Pressable>
            </View>

            <Pressable
                onPress={() => router.push("/profile/notifications")}
                className="relative h-10 w-10 items-center justify-center rounded-full border border-neutral-200"
            >
                <IconSymbol name="bell" size={20} color={colors.neutral[800]} />
                {unreadCount > 0 ? (
                    <View className="absolute right-1 top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1">
                        <Text className="text-[10px] font-semibold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Text>
                    </View>
                ) : null}
            </Pressable>
        </View>
    );
}
