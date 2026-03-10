import { IconSymbol } from "@/components/ui/icon-symbol";
import { useVoucherStore } from "@/store/zustand/voucher.store";
import { memo, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface DeliverySuccessModalProps {
  readonly visible: boolean;
  readonly onConfirm: () => void;
  readonly orderInfo?: {
    orderId: string;
    deliveryTime: string;
    orderTotal?: number;
  };
}

function DeliverySuccessModalComponent({
  visible,
  onConfirm,
  orderInfo,
}: DeliverySuccessModalProps) {
  const [generatedVoucher, setGeneratedVoucher] = useState<string | null>(null);
  const generateOrderVoucher = useVoucherStore(
    (state) => state.generateOrderVoucher,
  );

  useEffect(() => {
    if (
      visible &&
      orderInfo?.orderId &&
      orderInfo?.orderTotal &&
      !generatedVoucher
    ) {
      // Generate a voucher for the completed order
      const voucher = generateOrderVoucher(
        orderInfo.orderId,
        orderInfo.orderTotal,
      );
      setGeneratedVoucher(voucher.code);
    }
  }, [visible, orderInfo, generateOrderVoucher, generatedVoucher]);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-8 w-full items-center">
          {/* Success Icon */}
          <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center mb-6">
            <IconSymbol name="chevron.right" size={48} color="#ffffff" />
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
                <Text className="text-sm text-text-secondary">Order ID</Text>
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

          {/* Voucher Reward */}
          {generatedVoucher && (
            <View className="bg-green-50 rounded-xl p-4 w-full mb-6">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-lg">🎁</Text>
                <Text className="text-base font-semibold text-green-700">
                  Congratulations!
                </Text>
              </View>
              <Text className="text-sm text-green-600 mb-2">
                You've earned a voucher for your next order
              </Text>
              <View className="bg-white rounded-lg px-3 py-2 border-2 border-dashed border-green-300">
                <Text className="text-center font-bold text-green-700 text-lg">
                  {generatedVoucher}
                </Text>
              </View>
              <Text className="text-xs text-green-500 mt-2 text-center">
                Valid for 30 days • Check your profile for all vouchers
              </Text>
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
