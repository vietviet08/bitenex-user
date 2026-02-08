import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    DriverCard,
    TrackingTimeline,
    Driver,
    MapTrackingView,
    Location,
} from "@/components/tracking";

// Mock data - API ready interface
const MOCK_DRIVER: Driver = {
    id: "driver-1",
    name: "John Smith",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    totalDeliveries: 156,
    phone: "+84 912 345 678",
    vehicle: {
        type: "Motorcycle",
        model: "Honda Wave",
        plate: "59H1-12345",
        color: "Red",
    },
};

const MOCK_ORDER = {
    id: "order-123",
    status: "on_the_way" as const,
    restaurant: {
        name: "Burger Hub",
        address: "123 Food Street, District 1",
    },
    deliveryAddress: "456 Home Street, District 3",
    estimatedTime: "15 min",
};

const MOCK_LOCATIONS = {
    restaurant: {
        latitude: 10.7769,
        longitude: 106.7009,
    },
    driver: {
        latitude: 10.7835,
        longitude: 106.6957,
    },
    delivery: {
        latitude: 10.7904,
        longitude: 106.6893,
    },
};

function calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc1.latitude * Math.PI) / 180) *
            Math.cos((loc2.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function estimateArrival(distanceKm: number): string {
    const avgSpeedKmh = 25;
    const timeHours = distanceKm / avgSpeedKmh;
    const timeMinutes = Math.ceil(timeHours * 60);
    return `${timeMinutes} min`;
}

export default function TrackingScreen() {
    const [driverLocation, setDriverLocation] = useState<Location>(
        MOCK_LOCATIONS.driver,
    );
    const [estimatedTime, setEstimatedTime] = useState(
        MOCK_ORDER.estimatedTime,
    );
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);

    const handleDriverLocationUpdate = useCallback((location: Location) => {
        setDriverLocation(location);
        // Update ETA based on new location
        const distance = calculateDistance(location, MOCK_LOCATIONS.delivery);
        const eta = estimateArrival(distance);
        setEstimatedTime(eta);
    }, []);

    const handleChatPress = () => {
        router.push("/order/chat");
    };

    const handleCallPress = () => {
        router.push("/order/call");
    };

    const handleProfilePress = () => {
        router.push("/order/driver-profile");
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Track Order" />

            {/* Map outside ScrollView to avoid touch conflicts */}
            <View className="relative">
                <MapTrackingView
                    driverLocation={driverLocation}
                    deliveryLocation={MOCK_LOCATIONS.delivery}
                    onDriverLocationUpdate={handleDriverLocationUpdate}
                />
                {/* Expand fullscreen button */}
                <Pressable
                    onPress={() => setIsMapFullScreen(true)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-lg items-center justify-center shadow-md active:bg-gray-100"
                >
                    <IconSymbol name="fullscreen" size={22} color="#212121" />
                </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* ETA Card */}
                <View className="bg-primary-500 mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-white text-sm opacity-80">
                            Estimated Arrival
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            {estimatedTime}
                        </Text>
                    </View>
                    <View className="bg-white/20 px-4 py-2 rounded-lg">
                        <Text className="text-white font-semibold">
                            On the way
                        </Text>
                    </View>
                </View>

                {/* Driver Card */}
                <View className="px-4 mt-4">
                    <DriverCard
                        driver={MOCK_DRIVER}
                        variant="compact"
                        onChatPress={handleChatPress}
                        onCallPress={handleCallPress}
                        onProfilePress={handleProfilePress}
                    />
                </View>

                {/* Order Timeline */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-lg text-text-primary mb-4">
                        Order Status
                    </Text>
                    <TrackingTimeline currentStatus={MOCK_ORDER.status} />
                </View>

                {/* Order Details */}
                <View className="bg-white mx-4 mt-4 mb-6 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-lg text-text-primary mb-3">
                        Delivery Details
                    </Text>
                    <View className="flex-row items-start gap-3 mb-3">
                        <View className="w-3 h-3 rounded-full bg-orange-500 mt-1.5" />
                        <View className="flex-1">
                            <Text className="text-sm text-text-secondary">
                                From
                            </Text>
                            <Text className="font-medium text-text-primary">
                                {MOCK_ORDER.restaurant.name}
                            </Text>
                            <Text className="text-sm text-text-secondary">
                                {MOCK_ORDER.restaurant.address}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-start gap-3">
                        <View className="w-3 h-3 rounded-full bg-primary-500 mt-1.5" />
                        <View className="flex-1">
                            <Text className="text-sm text-text-secondary">
                                To
                            </Text>
                            <Text className="font-medium text-text-primary">
                                Your Address
                            </Text>
                            <Text className="text-sm text-text-secondary">
                                {MOCK_ORDER.deliveryAddress}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fullscreen Map Modal */}
            <Modal
                visible={isMapFullScreen}
                animationType="slide"
                statusBarTranslucent
            >
                <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                        <Pressable
                            onPress={() => setIsMapFullScreen(false)}
                            className="p-2 -ml-2 rounded-full active:bg-gray-100"
                        >
                            <IconSymbol
                                name="arrow-back"
                                size={24}
                                color="#212121"
                            />
                        </Pressable>
                        <Text className="font-bold text-lg text-text-primary">
                            Live Tracking
                        </Text>
                        <View className="w-10" />
                    </View>

                    {/* Fullscreen Map */}
                    <View className="flex-1">
                        <MapTrackingView
                            driverLocation={driverLocation}
                            deliveryLocation={MOCK_LOCATIONS.delivery}
                            onDriverLocationUpdate={handleDriverLocationUpdate}
                            fullScreen
                        />
                    </View>

                    {/* Bottom ETA overlay */}
                    <View className="absolute bottom-0 left-0 right-0 pb-8 px-4">
                        <View className="bg-primary-500 rounded-2xl p-4 flex-row items-center justify-between shadow-lg">
                            <View>
                                <Text className="text-white text-sm opacity-80">
                                    Estimated Arrival
                                </Text>
                                <Text className="text-white text-2xl font-bold">
                                    {estimatedTime}
                                </Text>
                            </View>
                            <View className="bg-white/20 px-4 py-2 rounded-lg">
                                <Text className="text-white font-semibold">
                                    On the way
                                </Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
