import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  return (
    <SafeAreaView className="flex-1 text-center bg-white justify-center items-center">
      <Text className="text-xl font-bold">Cart</Text>
    </SafeAreaView>
  );
}
