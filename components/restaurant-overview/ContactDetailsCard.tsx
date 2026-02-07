import { View, Text, Pressable, Linking } from "react-native";
import { memo, useCallback } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

interface ContactDetailsCardProps {
    readonly phone: string;
    readonly address: string;
    readonly website: string;
}

export const ContactDetailsCard = memo(function ContactDetailsCard({
    phone,
    address,
    website,
}: ContactDetailsCardProps) {
    const handlePhonePress = useCallback(() => {
        Linking.openURL(`tel:${phone.replaceAll(/[^0-9+]/g, "")}`);
    }, [phone]);

    const handleAddressPress = useCallback(() => {
        const encodedAddress = encodeURIComponent(
            address.replaceAll("\n", ", "),
        );
        Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        );
    }, [address]);

    const handleWebsitePress = useCallback(() => {
        Linking.openURL(website);
    }, [website]);

    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Contact Details
            </Text>

            <View className="gap-3">
                {/* Phone */}
                <Pressable
                    onPress={handlePhonePress}
                    className="flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                >
                    <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                        <IconSymbol
                            name="phone"
                            size={20}
                            color={colors.primary[500]}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-neutral-500">Phone</Text>
                        <Text className="text-base text-primary-500 font-medium">
                            {phone}
                        </Text>
                    </View>
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={colors.neutral[400]}
                    />
                </Pressable>

                {/* Address */}
                <Pressable
                    onPress={handleAddressPress}
                    className="flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                >
                    <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                        <IconSymbol
                            name="location-on"
                            size={20}
                            color={colors.primary[500]}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-neutral-500">
                            Address
                        </Text>
                        <Text className="text-base text-neutral-900">
                            {address.replaceAll("\n", ", ")}
                        </Text>
                    </View>
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={colors.neutral[400]}
                    />
                </Pressable>

                {/* Website */}
                <Pressable
                    onPress={handleWebsitePress}
                    className="flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                >
                    <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                        <IconSymbol
                            name="web"
                            size={20}
                            color={colors.primary[500]}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-neutral-500">
                            Website
                        </Text>
                        <Text className="text-base text-primary-500 font-medium">
                            {website.replace(/^https?:\/\//, "")}
                        </Text>
                    </View>
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={colors.neutral[400]}
                    />
                </Pressable>
            </View>
        </View>
    );
});
