import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCartStore, useCartItems } from '@/store';
import { formatCurrency } from '@/utils';

export default function CartScreen() {
  const items = useCartItems();
  const { getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    // TODO: Navigate to checkout flow
    console.log('[Cart] Proceeding to checkout');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-secondary" edges={['bottom']}>
        <View className="flex-1 items-center justify-center p-2xl">
          <Text className="text-2xl font-semibold text-text-primary mb-sm">Your cart is empty</Text>
          <Text className="text-base text-text-secondary text-center mb-2xl">
            Add items from a restaurant to get started
          </Text>
          <TouchableOpacity
            className="px-2xl py-md bg-primary-500 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-base font-semibold text-text-inverse">Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-secondary" edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-background-primary p-md rounded-xl mb-sm">
            <View className="flex-row items-start flex-1">
              <Text className="text-sm font-medium text-primary-500 mr-sm min-w-[24px]">{item.quantity}x</Text>
              <View className="flex-1">
                <Text className="text-base text-text-primary">{item.name}</Text>
                {item.options.length > 0 && (
                  <Text className="text-sm text-text-tertiary mt-0.5">
                    {item.options.map((o) => o.name).join(', ')}
                  </Text>
                )}
              </View>
            </View>
            <Text className="text-sm font-medium text-text-primary">
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="bg-background-primary p-lg rounded-xl mt-md">
            <View className="flex-row justify-between mb-sm">
              <Text className="text-base text-text-secondary">Subtotal</Text>
              <Text className="text-base text-text-primary">{formatCurrency(getSubtotal())}</Text>
            </View>
            <View className="flex-row justify-between mb-sm">
              <Text className="text-base text-text-secondary">Delivery Fee</Text>
              <Text className="text-base text-text-primary">{formatCurrency(getDeliveryFee())}</Text>
            </View>
            <View className="h-px bg-border-light my-md" />
            <View className="flex-row justify-between">
              <Text className="text-xl font-semibold text-text-primary">Total</Text>
              <Text className="text-xl font-semibold text-primary-500">{formatCurrency(getTotal())}</Text>
            </View>
          </View>
        )}
      />

      {/* Checkout Button */}
      <View className="p-lg bg-background-primary border-t border-border-light">
        <TouchableOpacity className="h-[52px] bg-primary-500 rounded-xl items-center justify-center" onPress={handleCheckout}>
          <Text className="text-base font-semibold text-text-inverse">
            Checkout • {formatCurrency(getTotal())}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
