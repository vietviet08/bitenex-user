import React, { memo } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface DeliverySuccessModalProps {
    readonly visible: boolean;
    readonly onConfirm: () => void;
    readonly orderInfo?: {
        orderId: string;
        deliveryTime: string;
    };
}

function DeliverySuccessModalComponent({
    visible,
    onConfirm,
    orderInfo,
}: DeliverySuccessModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-3xl p-8 w-full items-center">
                    {/* Success Icon */}
                    <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center mb-6">
                        <IconSymbol
                            name="chevron.right"
                            size={48}
                            color="#ffffff"
                        />
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-text-primary text-center mb-2">
                        Order Delivered!
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-base text-text-secondary text-center mb-6">
                        Your order has been delivered successfully
                    </Text>

                    {/* Order Info */}
                    {orderInfo && (
                        <View className="bg-gray-50 rounded-xl p-4 w-full mb-6">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-text-secondary">
                                    Order ID
                                </Text>
                                <Text className="text-sm font-semibold text-text-primary">
                                    #{orderInfo.orderId}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-text-secondary">
                                    Delivered at
                                </Text>
                                <Text className="text-sm font-semibold text-text-primary">
                                    {orderInfo.deliveryTime}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Confirm Button */}
                    <Pressable
                        onPress={onConfirm}
                        className="bg-primary-500 w-full py-4 rounded-xl items-center active:bg-primary-600"
                    >
                        <Text className="text-white font-bold text-lg">OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

export const DeliverySuccessModal = memo(DeliverySuccessModalComponent);
