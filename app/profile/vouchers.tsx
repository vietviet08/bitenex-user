import { ScreenHeader } from "@/components/profile";
import {
  useActiveVouchers,
  useExpiredVouchers,
  useUsedVouchers,
  type Voucher,
} from "@/store/zustand/voucher.store";
import { FlashList } from "@shopify/flash-list";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface VoucherCardProps {
  voucher: Voucher;
  isExpired?: boolean;
  isUsed?: boolean;
}

function VoucherCard({
  voucher,
  isExpired = false,
  isUsed = false,
}: VoucherCardProps) {
  const getStatusColor = () => {
    if (isUsed) return "text-gray-500";
    if (isExpired) return "text-red-500";
    return "text-green-600";
  };

  const getStatusText = () => {
    if (isUsed) return "Used";
    if (isExpired) return "Expired";
    return "Active";
  };

  const getDiscountText = () => {
    switch (voucher.type) {
      case "percentage":
        return `${(voucher.value * 100).toFixed(0)}% OFF`;
      case "fixed_amount":
        return `$${voucher.value.toFixed(2)} OFF`;
      case "free_delivery":
        return "FREE DELIVERY";
      default:
        return "";
    }
  };

  return (
    <View
      className={`bg-white rounded-xl p-4 mx-4 mb-3 border-2 ${isUsed || isExpired ? "border-gray-200" : "border-green-200"}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text
            className={`text-lg font-bold ${isUsed || isExpired ? "text-gray-500" : "text-green-700"}`}
          >
            {getDiscountText()}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {voucher.description}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-full ${isUsed || isExpired ? "bg-gray-100" : "bg-green-100"}`}
        >
          <Text className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <Text className="text-center font-mono font-bold text-lg text-gray-800">
          {voucher.code}
        </Text>
      </View>

      <View className="flex-row justify-between text-xs text-gray-500">
        <Text className="text-xs text-gray-500">
          Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
        </Text>
        {voucher.minimumOrderValue && (
          <Text className="text-xs text-gray-500">
            Min. order: ${voucher.minimumOrderValue}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function VouchersScreen() {
  const activeVouchers = useActiveVouchers();
  const usedVouchers = useUsedVouchers();
  const expiredVouchers = useExpiredVouchers();

  const sections = [
    {
      title: "Active Vouchers",
      data: activeVouchers,
      emptyMessage: "No active vouchers",
    },
    {
      title: "Used Vouchers",
      data: usedVouchers,
      emptyMessage: "No used vouchers",
    },
    {
      title: "Expired Vouchers",
      data: expiredVouchers,
      emptyMessage: "No expired vouchers",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="My Vouchers" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {sections.map((section, sectionIndex) => (
          <View key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
            <Text className="text-lg font-semibold text-gray-800 mx-4 mb-3">
              {section.title} ({section.data.length})
            </Text>

            {section.data.length > 0 ? (
              <FlashList
                data={section.data}
                renderItem={({ item }) => (
                  <VoucherCard
                    voucher={item}
                    isExpired={section.title === "Expired Vouchers"}
                    isUsed={section.title === "Used Vouchers"}
                  />
                )}
                estimatedItemSize={120}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="mx-4 mb-4">
                <Text className="text-center text-gray-500 py-8">
                  {section.emptyMessage}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Info Section */}
        <View className="bg-blue-50 rounded-xl p-4 mx-4 mb-6">
          <Text className="text-sm text-blue-800 font-medium mb-2">
            How to use vouchers:
          </Text>
          <Text className="text-sm text-blue-700">
            • Vouchers are automatically generated after completing orders{"\n"}
            • Apply voucher codes in the cart during checkout{"\n"}• Each
            voucher can only be used once{"\n"}• Check expiration dates before
            use
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
