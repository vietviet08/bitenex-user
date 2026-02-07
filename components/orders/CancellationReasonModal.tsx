import React, { memo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

const CANCELLATION_REASONS = [
    { id: "waiting_long", label: "Waiting for long time" },
    { id: "unable_contact", label: "Unable to contact driver" },
    { id: "driver_denied_dest", label: "Driver denied to go to destination" },
    { id: "driver_denied_pickup", label: "Driver denied to come to pickup" },
    { id: "wrong_address", label: "Wrong address shown" },
    { id: "price_unreasonable", label: "The price is not reasonable" },
    { id: "order_other", label: "I want to order another restaurant" },
    { id: "just_cancel", label: "I just want to cancel" },
];

interface CancellationReasonModalProps {
    orderId?: string;
    onSubmit?: (reason: string, otherReason?: string) => void;
}

function CancellationReasonModalComponent({
    orderId,
    onSubmit,
}: Readonly<CancellationReasonModalProps>) {
    const insets = useSafeAreaInsets();
    const [selectedReason, setSelectedReason] =
        useState<string>("waiting_long");
    const [otherReason, setOtherReason] = useState("");

    const handleBack = () => {
        router.back();
    };

    const handleSubmit = () => {
        onSubmit?.(selectedReason, otherReason);
        router.back();
    };

    return (
        <View className="flex-1 bg-background-secondary">
            {/* Header */}
            <View
                className="flex-row items-center gap-4 px-6 pb-4"
                style={{ paddingTop: insets.top + 16 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="p-1 rounded-full active:bg-gray-200"
                >
                    <IconSymbol name="arrow-back" size={24} color="#212121" />
                </Pressable>
                <Text className="text-2xl font-bold text-text-primary">
                    Cancel Order
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-lg text-text-secondary mb-6 mt-2">
                    Please select the reason for cancellation:
                </Text>

                <View className="h-px bg-border-light mb-6" />

                {/* Radio Buttons */}
                <View className="gap-6">
                    {CANCELLATION_REASONS.map((reason) => {
                        const isSelected = selectedReason === reason.id;
                        return (
                            <Pressable
                                key={reason.id}
                                onPress={() => setSelectedReason(reason.id)}
                                className="flex-row items-center gap-3"
                            >
                                <View
                                    className={`w-5 h-5 rounded-full border-2 border-primary-500 items-center justify-center`}
                                >
                                    {isSelected && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                                    )}
                                </View>
                                <Text className="text-lg font-semibold text-text-primary">
                                    {reason.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Others Section */}
                <View className="mt-8 mb-6">
                    <Text className="text-lg font-bold text-text-primary mb-3">
                        Others
                    </Text>
                    <TextInput
                        value={otherReason}
                        onChangeText={setOtherReason}
                        placeholder="Others reason..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
                        className="bg-white text-text-primary rounded-xl border border-gray-200 p-4 text-sm"
                        style={{ textAlignVertical: "top", minHeight: 80 }}
                    />
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View
                className="px-6 pt-4 border-t border-transparent shadow-lg bg-background-secondary"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                <Pressable
                    onPress={handleSubmit}
                    className="w-full bg-primary-500 py-4 rounded-full items-center active:opacity-80 shadow-lg"
                >
                    <Text className="text-white font-bold text-lg">Submit</Text>
                </Pressable>
            </View>
        </View>
    );
}

export const CancellationReasonModal = memo(CancellationReasonModalComponent);
