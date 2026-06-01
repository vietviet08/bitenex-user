import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

import { DeliverySuccessModal } from "@/components/feedback";
import { ScreenHeader } from "@/components/profile";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    getOrderTracking,
    socketClient,
    type DriverLocationData,
    type OrderStatusEventData,
    type OrderTrackingResponse,
} from "@/services";

type Coordinate = {
    latitude: number;
    longitude: number;
};

type TimelineStatus =
    | "placed"
    | "confirmed"
    | "preparing"
    | "picked_up"
    | "on_the_way"
    | "delivered";

const REFRESH_MS = 10000;
const DEFAULT_COORDINATE: Coordinate = {
    latitude: 15.9762587,
    longitude: 108.1877276,
};

function isSameOrder(eventOrderId: string | undefined, orderId: string): boolean {
    return eventOrderId === orderId;
}

function toCoordinate(latitude?: number | null, longitude?: number | null): Coordinate | null {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return null;
    }
    return { latitude, longitude };
}

function calculateDistance(loc1: Coordinate, loc2: Coordinate): number {
    const radiusKm = 6371;
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc1.latitude * Math.PI) / 180) *
            Math.cos((loc2.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateArrival(distanceKm: number): string {
    const minutes = Math.max(1, Math.ceil((distanceKm / 25) * 60));
    return `${minutes} min`;
}

function toTimelineStatus(status: string): TimelineStatus {
    switch (status) {
        case "PENDING":
            return "placed";
        case "CONFIRMED":
            return "confirmed";
        case "PREPARING":
        case "READY":
            return "preparing";
        case "PICKING_UP":
            return "picked_up";
        case "DELIVERING":
            return "on_the_way";
        case "DELIVERED":
            return "delivered";
        default:
            return "placed";
    }
}

function getTrackingMode(status: string): string {
    if (status === "PICKING_UP") {
        return "Driver is heading to the restaurant";
    }
    if (status === "DELIVERING") {
        return "Driver is heading to you";
    }
    if (status === "DELIVERED") {
        return "Delivered";
    }
    if (status === "READY") {
        return "Waiting for driver pickup";
    }
    return "Restaurant is preparing your order";
}

function formatDriverRating(rating?: number | null): string {
    if (typeof rating !== "number" || Number.isNaN(rating) || rating <= 0) {
        return "Chưa có đánh giá";
    }
    return `${rating.toFixed(1)} sao`;
}

function buildMapHtml({
    driver,
    destination,
    pickup,
    delivery,
    destinationLabel,
}: {
    driver: Coordinate | null;
    destination: Coordinate | null;
    pickup: Coordinate | null;
    delivery: Coordinate | null;
    destinationLabel: string;
}) {
    const center = driver ?? destination ?? pickup ?? delivery ?? DEFAULT_COORDINATE;
    const payload = JSON.stringify({
        center,
        driver,
        destination,
        pickup,
        delivery,
        destinationLabel,
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #f3f4f6; }
    .marker { width: 30px; height: 30px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25); }
    .driver { background: #2563eb; }
    .pickup { background: #f97316; }
    .delivery { background: #16a34a; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const data = ${payload};
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([data.center.latitude, data.center.longitude], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    const points = [];
    const icon = (className) => L.divIcon({ className: '', html: '<div class="marker ' + className + '"></div>', iconSize: [30, 30], iconAnchor: [15, 15] });
    const addMarker = (point, label, className) => {
      if (!point) return;
      const latLng = [point.latitude, point.longitude];
      L.marker(latLng, { icon: icon(className) }).addTo(map).bindPopup(label);
      points.push(latLng);
    };
    addMarker(data.driver, 'Driver', 'driver');
    addMarker(data.pickup, 'Restaurant', 'pickup');
    addMarker(data.delivery, 'Delivery', 'delivery');
    
    if (data.driver && data.destination) {
      // Draw straight fallback dashed line
      const backupLine = L.polyline([[data.driver.latitude, data.driver.longitude], [data.destination.latitude, data.destination.longitude]], {
        color: '#2563eb',
        weight: 5,
        opacity: 0.5,
        dashArray: '8, 8'
      }).addTo(map);

      // Fetch shortest road path via OSRM API (lon,lat;lon,lat)
      const url = 'https://router.project-osrm.org/route/v1/driving/' + 
        data.driver.longitude + ',' + data.driver.latitude + ';' + 
        data.destination.longitude + ',' + data.destination.latitude + 
        '?overview=full&geometries=geojson';

      fetch(url)
        .then(res => res.json())
        .then(resData => {
          if (resData.code === 'Ok' && resData.routes && resData.routes.length > 0) {
            map.removeLayer(backupLine);
            const route = resData.routes[0];
            const coordinates = route.geometry.coordinates;
            const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
            L.polyline(latLngs, {
              color: '#2563eb',
              weight: 6,
              opacity: 0.8
            }).addTo(map);
          }
        })
        .catch(err => console.log('OSRM routing error:', err));
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 16 });
    }
  </script>
</body>
</html>`;
}

function LiveTrackingMap({
    driver,
    pickup,
    delivery,
    destination,
    destinationLabel,
    fullScreen = false,
}: {
    driver: Coordinate | null;
    pickup: Coordinate | null;
    delivery: Coordinate | null;
    destination: Coordinate | null;
    destinationLabel: string;
    fullScreen?: boolean;
}) {
    const html = useMemo(
        () => buildMapHtml({ driver, pickup, delivery, destination, destinationLabel }),
        [delivery, destination, destinationLabel, driver, pickup],
    );

    return (
        <View className={fullScreen ? "flex-1" : "h-72 bg-gray-100"}>
            <WebView
                key={`${driver?.latitude ?? "x"}-${driver?.longitude ?? "x"}-${destination?.latitude ?? "x"}-${destination?.longitude ?? "x"}`}
                source={{ html }}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
            />
        </View>
    );
}

export default function TrackingScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [driverLocation, setDriverLocation] = useState<Coordinate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const [showDeliverySuccess, setShowDeliverySuccess] = useState(false);

    const loadTracking = useCallback(async () => {
        if (!orderId) {
            setError("Missing order id.");
            setIsLoading(false);
            return;
        }

        try {
            const data = await getOrderTracking(orderId);
            setTracking(data);
            setDriverLocation((current) => current ?? toCoordinate(data.driver_latitude, data.driver_longitude));
            setShowDeliverySuccess(data.status === "DELIVERED");
            setError(null);
        } catch {
            setError("Could not load tracking data.");
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        loadTracking();
        const interval = setInterval(loadTracking, REFRESH_MS);
        return () => clearInterval(interval);
    }, [loadTracking]);

    useEffect(() => {
        if (!orderId) return;

        const handleLocation = (payload: DriverLocationData) => {
            const payloadOrderId = payload.order_id ?? payload.orderId;
            if (!isSameOrder(payloadOrderId, orderId)) return;
            setDriverLocation({
                latitude: payload.latitude,
                longitude: payload.longitude,
            });
        };

        const handleStatus = (payload: OrderStatusEventData) => {
            const payloadOrderId = payload.order_id ?? payload.orderId;
            if (!isSameOrder(payloadOrderId, orderId)) return;
            loadTracking();
        };

        socketClient.on("driver.location_updated", handleLocation);
        socketClient.on("order.status_changed", handleStatus);
        return () => {
            socketClient.off("driver.location_updated", handleLocation);
            socketClient.off("order.status_changed", handleStatus);
        };
    }, [loadTracking, orderId]);

    const pickup = useMemo(
        () => toCoordinate(tracking?.pickup_latitude, tracking?.pickup_longitude),
        [tracking?.pickup_latitude, tracking?.pickup_longitude],
    );
    const delivery = useMemo(
        () => toCoordinate(tracking?.delivery_latitude, tracking?.delivery_longitude),
        [tracking?.delivery_latitude, tracking?.delivery_longitude],
    );
    const destination = tracking?.status === "PICKING_UP" ? pickup : delivery;
    const statusLabel = tracking ? getTrackingMode(tracking.status) : "Loading";
    const estimatedTime =
        driverLocation && destination
            ? estimateArrival(calculateDistance(driverLocation, destination))
            : "Waiting";

    const handleDeliveryConfirm = () => {
        setShowDeliverySuccess(false);
        if (!orderId) {
            router.replace("/(tabs)");
            return;
        }
        setTimeout(() => {
            router.replace({
                pathname: "/order/driver-rating",
                params: { orderId },
            });
        }, 100);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
                <ScreenHeader title="Track Order" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ff6b35" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !tracking) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
                <ScreenHeader title="Track Order" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-text-primary text-lg font-semibold text-center">
                        {error ?? "Tracking data is unavailable."}
                    </Text>
                    <Pressable
                        onPress={loadTracking}
                        className="mt-4 bg-primary-500 px-5 py-3 rounded-xl active:opacity-80"
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Track Order" />

            <View className="relative">
                <LiveTrackingMap
                    driver={driverLocation}
                    pickup={pickup}
                    delivery={delivery}
                    destination={destination}
                    destinationLabel={statusLabel}
                />
                <Pressable
                    onPress={() => setIsMapFullScreen(true)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-lg items-center justify-center shadow-md active:bg-gray-100"
                >
                    <IconSymbol name="fullscreen" size={22} color="#212121" />
                </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="bg-primary-500 mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-white text-sm opacity-80">Estimated Arrival</Text>
                        <Text className="text-white text-2xl font-bold">{estimatedTime}</Text>
                    </View>
                    <View className="bg-white/20 px-4 py-2 rounded-lg max-w-[190px]">
                        <Text className="text-white font-semibold text-center">{statusLabel}</Text>
                    </View>
                </View>

                <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-lg text-text-primary mb-3">
                        Driver
                    </Text>
                    <View className="flex-row items-center gap-3">
                        <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                            <IconSymbol name="map-pin" size={24} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-text-primary">
                                {tracking.driver_name ??
                                    (tracking.driver_id ? "Tài xế đã nhận đơn" : "Đang chờ tài xế")}
                            </Text>
                            <Text className="text-sm text-text-secondary mt-0.5">
                                {tracking.driver_id
                                    ? `${formatDriverRating(tracking.driver_average_rating)}${
                                          tracking.driver_total_deliveries
                                              ? ` • ${tracking.driver_total_deliveries} chuyến`
                                              : ""
                                      }`
                                    : "Vị trí sẽ hiển thị sau khi tài xế nhận đơn."}
                            </Text>
                            <Text className="text-xs text-text-secondary mt-1">
                                {driverLocation
                                    ? "GPS trực tiếp đang cập nhật từ app tài xế."
                                    : "Chưa có vị trí GPS trực tiếp."}
                            </Text>
                        </View>
                    </View>
                    {tracking.driver_id ? (
                        <Pressable
                            onPress={() =>
                                router.push({
                                    pathname: "/order/chat",
                                    params: { orderId },
                                })
                            }
                            className="mt-4 bg-primary-500/10 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                        >
                            <IconSymbol name="chat" size={18} color="#ff6b35" />
                            <Text className="text-primary-500 font-semibold ml-2">
                                Chat với tài xế
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-lg text-text-primary mb-4">
                        Order Status
                    </Text>
                    <TrackingTimeline currentStatus={toTimelineStatus(tracking.status)} />
                </View>

                <View className="bg-white mx-4 mt-4 mb-6 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-lg text-text-primary mb-3">
                        Delivery Details
                    </Text>
                    <View className="flex-row items-start gap-3 mb-3">
                        <View className="w-3 h-3 rounded-full bg-orange-500 mt-1.5" />
                        <View className="flex-1">
                            <Text className="text-sm text-text-secondary">From</Text>
                            <Text className="font-medium text-text-primary">
                                {tracking.merchant_name}
                            </Text>
                            <Text className="text-sm text-text-secondary">
                                {tracking.pickup_address}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-start gap-3">
                        <View className="w-3 h-3 rounded-full bg-primary-500 mt-1.5" />
                        <View className="flex-1">
                            <Text className="text-sm text-text-secondary">To</Text>
                            <Text className="font-medium text-text-primary">
                                Your Address
                            </Text>
                            <Text className="text-sm text-text-secondary">
                                {tracking.delivery_address}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <DeliverySuccessModal
                visible={showDeliverySuccess}
                onConfirm={handleDeliveryConfirm}
                orderInfo={{
                    orderId: tracking.order_number,
                    deliveryTime: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }}
            />

            <Modal visible={isMapFullScreen} animationType="slide" statusBarTranslucent>
                <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
                    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                        <Pressable
                            onPress={() => setIsMapFullScreen(false)}
                            className="p-2 -ml-2 rounded-full active:bg-gray-100"
                        >
                            <IconSymbol name="arrow-back" size={24} color="#212121" />
                        </Pressable>
                        <Text className="font-bold text-lg text-text-primary">Live Tracking</Text>
                        <View className="w-10" />
                    </View>

                    <LiveTrackingMap
                        driver={driverLocation}
                        pickup={pickup}
                        delivery={delivery}
                        destination={destination}
                        destinationLabel={statusLabel}
                        fullScreen
                    />

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
                            <View className="bg-white/20 px-4 py-2 rounded-lg max-w-[190px]">
                                <Text className="text-white font-semibold text-center">
                                    {statusLabel}
                                </Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
