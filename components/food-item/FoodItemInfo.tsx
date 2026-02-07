import { View, Text } from "react-native";

interface FoodItemInfoProps {
    readonly name: string;
    readonly description: string;
    readonly price: number;
}

export function FoodItemInfo({ name, description, price }: FoodItemInfoProps) {
    return (
        <View className="px-4 py-4">
            <Text className="text-2xl font-bold text-neutral-900">{name}</Text>
            <Text className="text-base text-neutral-600 mt-2">{description}</Text>
            <Text className="text-xl font-bold text-primary-500 mt-3">
                ${price.toFixed(2)}
            </Text>
        </View>
    );
}
