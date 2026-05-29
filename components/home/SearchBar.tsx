import { View, TextInput, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/theme';

export function SearchBar() {
  return (
    <View className="mx-4 mt-3 mb-2 flex-row items-center border border-neutral-200 rounded-xl bg-white shadow-sm">
      {/* Search icon + input */}
      <View className="flex-1 flex-row items-center px-3 py-2.5">
        <IconSymbol name="search" size={20} color={colors.primary[500]} />
        <TextInput
          className="flex-1 ml-2 text-sm text-neutral-900"
          placeholder="What are you craving?"
          placeholderTextColor={colors.neutral[400]}
          editable={false}
        />
      </View>

      {/* Separator + filter button */}
      <View className="border-l border-neutral-200 px-3 py-2.5">
        <Pressable hitSlop={8}>
          <IconSymbol name="tune" size={20} color={colors.neutral[600]} />
        </Pressable>
      </View>
    </View>
  );
}
