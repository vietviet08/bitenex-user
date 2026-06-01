import React, { useState, useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, AddressCard } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { api } from "@/services";

interface Address {
    id: string;
    label: string;
    address: string;
    isDefault: boolean;
}

function mapAddress(item: any): Address {
    const parts = [item.address_line1, item.address_line2, item.city].filter(Boolean);
    return {
        id: item.id,
        label: item.label,
        address: parts.join(", "),
        isDefault: item.is_default,
    };
}

export default function AddressesScreen() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAddresses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<any[]>("/users/profile/addresses");
            setAddresses(response.data.map(mapAddress));
        } catch (error) {
            console.error("Failed to load addresses", error);
            Alert.alert("Lỗi", "Không thể lấy danh sách địa chỉ.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const handleEdit = useCallback((id: string) => {
        // Future: navigate to edit address
        console.log("Edit address:", id);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        Alert.alert(
            "Xóa địa chỉ",
            "Bạn có chắc chắn muốn xóa địa chỉ này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/users/profile/addresses/${id}`);
                            setAddresses((prev) => prev.filter((a) => a.id !== id));
                        } catch (error) {
                            console.error("Failed to delete address", error);
                            Alert.alert("Lỗi", "Không thể xóa địa chỉ. Vui lòng thử lại.");
                        }
                    },
                },
            ]
        );
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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
                <ScreenHeader title="Manage Addresses" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ff6b35" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Manage Addresses" />
            <FlashList
                data={addresses}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <Pressable
                        onPress={handleAddAddress}
                        className="flex-row items-center justify-center gap-2 py-4 mt-2 bg-white rounded-2xl border border-dashed border-gray-300 active:bg-gray-50"
                    >
                        <IconSymbol name="add" size={24} color="#ff6b35" />
                        <Text className="font-semibold text-primary-500">
                            Add New Address
                        </Text>
                    </Pressable>
                }
            />
        </SafeAreaView>
    );
}
