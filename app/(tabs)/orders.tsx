import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  return (
    <SafeAreaView className="flex-1 flex text-center bg-white justify-center items-center">
      <Text className="text-xl font-bold">Orders</Text>
    </SafeAreaView>
  );
}
