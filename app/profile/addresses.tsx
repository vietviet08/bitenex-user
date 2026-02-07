import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, AddressCard } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Address {
    id: string;
    label: string;
    address: string;
    isDefault: boolean;
}

const MOCK_ADDRESSES: Address[] = [
    {
        id: "1",
        label: "Home",
        address: "4517 Washington Ave. Manchester, Kentucky 39495",
        isDefault: true,
    },
    {
        id: "2",
        label: "Office",
        address: "2715 Ash Dr. San Jose, South Dakota 83475",
        isDefault: false,
    },
    {
        id: "3",
        label: "Apartment",
        address: "8502 Preston Rd. Inglewood, Maine 98380",
        isDefault: false,
    },
];

export default function AddressesScreen() {
    const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

    const handleEdit = useCallback((id: string) => {
        // Future: navigate to edit address
        console.log("Edit address:", id);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const handlePress = useCallback((id: string) => {
        // Future: set as default
        console.log("Address pressed:", id);
    }, []);

    const handleAddAddress = () => {
        // Future: navigate to add address screen
        console.log("Add new address");
    };

    const renderItem = useCallback(
        ({ item }: { item: Address }) => (
            <View className="mb-3">
                <AddressCard
                    id={item.id}
                    label={item.label}
                    address={item.address}
                    isDefault={item.isDefault}
                    onPress={handlePress}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </View>
        ),
        [handlePress, handleEdit, handleDelete]
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Manage Addresses" />
            <FlashList
                data={addresses}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={140}
                ListFooterComponent={
                    <Pressable
                        onPress={handleAddAddress}
                        className="flex-row items-center justify-center gap-2 py-4 mt-2 bg-white rounded-2xl border border-dashed border-gray-300 active:bg-gray-50"
                    >
                        <IconSymbol name="add" size={24} color="#22c55e" />
                        <Text className="font-semibold text-primary-500">
                            Add New Address
                        </Text>
                    </Pressable>
                }
            />
        </SafeAreaView>
    );
}
