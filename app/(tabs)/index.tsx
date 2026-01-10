import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { useUser, useCartItemCount } from '@/store';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const user = useUser();
  const cartItemCount = useCartItemCount();

  const handleOpenCart = () => {
    router.push('/(modal)/cart');
  };

  const handleSearch = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-lg py-md">
        <View className="flex-row items-center flex-1">
          <IconSymbol name="location.fill" size={20} color={colors.primary[500]} />
          <View className="ml-sm flex-1">
            <Text className="text-xs text-text-tertiary">Deliver to</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm font-medium text-text-primary mr-xs" numberOfLines={1}>
                {user ? 'Select address' : 'Set your location'}
              </Text>
              <IconSymbol name="chevron.down" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Button */}
        <TouchableOpacity className="relative p-sm" onPress={handleOpenCart}>
          <IconSymbol name="cart.fill" size={24} color={colors.text.primary} />
          {cartItemCount > 0 && (
            <View className="absolute top-0 right-0 bg-primary-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
              <Text className="text-xs text-text-inverse font-semibold" style={{ fontSize: 10 }}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity className="flex-row items-center bg-neutral-100 mx-lg px-md py-md rounded-lg mb-lg" onPress={handleSearch}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.text.tertiary} />
        <Text className="text-base text-text-tertiary ml-sm">Search restaurants or dishes...</Text>
      </TouchableOpacity>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Promotions Banner - Placeholder */}
        <View className="bg-primary-500 mx-lg p-xl rounded-2xl mb-xl">
          <Text className="text-2xl font-semibold text-text-inverse mb-xs">🔥 Free Delivery</Text>
          <Text className="text-base text-primary-100">On your first 3 orders</Text>
        </View>

        {/* Categories - Placeholder */}
        <View className="mb-xl">
          <Text className="text-xl font-semibold text-text-primary px-lg mb-md">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['🍔 Burgers', '🍕 Pizza', '🍜 Noodles', '🍣 Sushi', '🥗 Salads', '🧁 Desserts'].map(
              (category, index) => (
                <TouchableOpacity key={index} className="bg-neutral-100 px-lg py-md rounded-lg ml-lg">
                  <Text className="text-sm font-medium text-text-primary">{category}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Featured Restaurants - Placeholder */}
        <View className="mb-xl">
          <View className="flex-row justify-between items-center px-lg mb-md">
            <Text className="text-xl font-semibold text-text-primary px-lg mb-md">Featured Restaurants</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-primary-500">See all</Text>
            </TouchableOpacity>
          </View>

          {/* Restaurant cards will go here */}
          <View className="bg-neutral-100 mx-lg p-3xl rounded-2xl items-center">
            <Text className="text-base text-text-tertiary">Restaurant cards coming soon</Text>
          </View>
        </View>

        {/* Near You - Placeholder */}
        <View className="mb-xl">
          <View className="flex-row justify-between items-center px-lg mb-md">
            <Text className="text-xl font-semibold text-text-primary px-lg mb-md">Near You</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-primary-500">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-neutral-100 mx-lg p-3xl rounded-2xl items-center">
            <Text className="text-base text-text-tertiary">Nearby restaurants coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
