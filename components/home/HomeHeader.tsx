import { View, Text, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/theme';

export function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white">
      {/* Location section */}
      <View className="flex-1">
        <Text className="text-xs text-neutral-500 mb-0.5">Delivering to</Text>
        <Pressable className="flex-row items-center">
          <IconSymbol name="location-on" size={18} color={colors.primary[500]} />
          <Text className="text-base font-bold text-neutral-900 ml-1">
            Home - 123 Main St
          </Text>
          <IconSymbol name="expand-more" size={18} color={colors.neutral[500]} />
        </Pressable>
      </View>

      {/* Notification bell */}
      <Pressable className="relative w-10 h-10 items-center justify-center border border-neutral-200 rounded-full">
        <IconSymbol name="bell" size={20} color={colors.neutral[800]} />
        {/* Red badge dot */}
        <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </Pressable>
    </View>
  );
}
