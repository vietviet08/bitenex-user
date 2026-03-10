import { colors } from "@/theme";
import { memo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface VoucherInputProps {
  readonly currentVoucherCode: string;
  readonly onApplyVoucher: (code: string) => boolean;
  readonly onClearVoucher: () => void;
}

export const VoucherInput = memo(function VoucherInput({
  currentVoucherCode,
  onApplyVoucher,
  onClearVoucher,
}: VoucherInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleApply = () => {
    if (!inputValue.trim()) {
      setError("Please enter a voucher code");
      return;
    }

    const success = onApplyVoucher(inputValue);
    if (success) {
      setError("");
      setInputValue("");
    } else {
      setError("Invalid or expired voucher code");
    }
  };

  if (currentVoucherCode) {
    return (
      <View className="px-4 py-4 bg-green-50 rounded-xl mx-4 my-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-base text-green-600">🎁</Text>
            <Text className="text-base font-semibold text-green-600">
              {currentVoucherCode} applied
            </Text>
          </View>
          <Pressable onPress={onClearVoucher}>
            <Text className="text-sm font-medium text-green-500">Remove</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 py-4">
      <View className="flex-row gap-2">
        <TextInput
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            if (error) setError("");
          }}
          placeholder="Enter voucher code"
          placeholderTextColor={colors.neutral[400]}
          className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl text-base text-neutral-900 bg-white"
          autoCapitalize="characters"
        />
        <Pressable
          onPress={handleApply}
          className="bg-green-500 px-5 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-semibold">Apply</Text>
        </Pressable>
      </View>
      {error ? (
        <Text className="text-sm text-red-500 mt-2">{error}</Text>
      ) : null}
    </View>
  );
});
