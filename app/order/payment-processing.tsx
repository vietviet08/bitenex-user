import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentProcessingScreen() {
    const params = useLocalSearchParams<{
        orderId?: string;
        transactionId?: string;
    }>();

    const orderId = params.orderId ?? "";
    const transactionId = params.transactionId ?? "";

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center">
                <Text className="text-2xl font-bold text-text-primary text-center">
                    Complete Payment on VNPAY
                </Text>
                <Text className="text-base text-text-secondary text-center mt-3">
                    After completing payment, return to app and we will verify your
                    payment status from backend.
                </Text>

                <Pressable
                    onPress={() =>
                        router.push({
                            pathname: "/payment/result",
                            params: {
                                orderId,
                                transactionId,
                            },
                        })
                    }
                    className="mt-8 bg-primary-500 rounded-full py-4"
                >
                    <Text className="text-center text-white font-semibold text-base">
                        I Have Completed Payment
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => router.replace("/(tabs)/cart")}
                    className="mt-3 border border-gray-300 rounded-full py-4"
                >
                    <Text className="text-center text-text-primary font-semibold text-base">
                        Back To Cart
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
