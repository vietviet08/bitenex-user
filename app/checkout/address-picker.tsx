import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { locationService, type Coordinates } from "@/services/location";
import {
    useCheckoutStore,
    useDeliveryLocation,
} from "@/store/zustand/checkout.store";
import { colors } from "@/theme";

const DEFAULT_LOCATION: Coordinates = {
    latitude: 15.9762587,
    longitude: 108.1877276,
};

function formatCoordinates(location: Coordinates): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

export default function CheckoutAddressPickerScreen() {
    const selectedDeliveryLocation = useDeliveryLocation();
    const setDeliveryLocation = useCheckoutStore(
        (state) => state.setDeliveryLocation,
    );
    const [selectedLocation, setSelectedLocation] = useState<Coordinates>(
        selectedDeliveryLocation ?? DEFAULT_LOCATION,
    );
    const [selectedAddress, setSelectedAddress] = useState(
        selectedDeliveryLocation?.address ?? "Move the map or tap a point",
    );
    const [isLocating, setIsLocating] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);

    const resolveAddress = useCallback(async (location: Coordinates) => {
        setIsResolvingAddress(true);
        const address = await locationService.reverseGeocode(location);
        setSelectedAddress(
            address?.formattedAddress || formatCoordinates(location),
        );
        setIsResolvingAddress(false);
    }, []);

    const selectLocation = useCallback(
        (location: Coordinates) => {
            setSelectedLocation(location);
            void resolveAddress(location);
        },
        [resolveAddress],
    );

    const handleUseCurrentLocation = useCallback(async () => {
        setIsLocating(true);
        try {
            const location = await locationService.getCurrentLocation();
            if (!location) {
                Alert.alert(
                    "Location Permission Required",
                    "Please allow location access to use your current position.",
                );
                return;
            }

            selectLocation({
                latitude: location.latitude,
                longitude: location.longitude,
            });
        } finally {
            setIsLocating(false);
        }
    }, [selectLocation]);

    useEffect(() => {
        if (!selectedDeliveryLocation) {
            void handleUseCurrentLocation();
            return;
        }
        void resolveAddress(selectedDeliveryLocation);
    }, [handleUseCurrentLocation, resolveAddress, selectedDeliveryLocation]);

    const mapHtml = useMemo(
        () => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .pin {
      width: 42px;
      height: 42px;
      border-radius: 21px;
      background: #FE8C00;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,.28);
      position: relative;
    }
    .pin:after {
      content: "";
      position: absolute;
      left: 15px;
      top: 15px;
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: white;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const initialLat = ${selectedLocation.latitude};
    const initialLng = ${selectedLocation.longitude};
    const map = L.map('map', { zoomControl: false }).setView([initialLat, initialLng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: ''
    }).addTo(map);
    const icon = L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [42, 42], iconAnchor: [21, 21] });
    const marker = L.marker([initialLat, initialLng], { icon }).addTo(map);
    map.on('click', function(event) {
      marker.setLatLng(event.latlng);
      map.panTo(event.latlng);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      }));
    });
  </script>
</body>
</html>`,
        [selectedLocation.latitude, selectedLocation.longitude],
    );

    const handleMapMessage = useCallback(
        (event: WebViewMessageEvent) => {
            let payload: Coordinates;
            try {
                payload = JSON.parse(event.nativeEvent.data) as Coordinates;
            } catch {
                return;
            }

            if (
                Number.isFinite(payload.latitude) &&
                Number.isFinite(payload.longitude)
            ) {
                selectLocation(payload);
            }
        },
        [selectLocation],
    );

    const confirmLocation = useCallback(() => {
        setDeliveryLocation({
            address: selectedAddress,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
        });
        router.back();
    }, [selectedAddress, selectedLocation, setDeliveryLocation]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <View className="flex-row items-center gap-3 px-4 py-3 border-b border-neutral-100">
                <Pressable
                    onPress={() => router.back()}
                    className="h-10 w-10 rounded-full bg-neutral-100 items-center justify-center active:opacity-80"
                >
                    <IconSymbol name="arrow-back" size={22} color="#111827" />
                </Pressable>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-neutral-900">
                        Choose Delivery Location
                    </Text>
                    <Text className="text-xs text-neutral-500">
                        Tap on the map to set the destination
                    </Text>
                </View>
            </View>

            <View className="flex-1">
                <WebView
                    key={formatCoordinates(selectedLocation)}
                    originWhitelist={["*"]}
                    source={{ html: mapHtml }}
                    onMessage={handleMapMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    geolocationEnabled
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                />

                <View className="absolute left-4 right-4 bottom-6 rounded-2xl bg-white p-4 shadow-lg">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Delivery point
                    </Text>
                    <Text className="mt-1 text-base font-semibold text-neutral-900">
                        {isResolvingAddress
                            ? "Resolving address..."
                            : selectedAddress}
                    </Text>
                    <Text className="mt-1 text-xs text-neutral-500">
                        {formatCoordinates(selectedLocation)}
                    </Text>

                    <View className="flex-row gap-3 mt-4">
                        <Pressable
                            onPress={handleUseCurrentLocation}
                            disabled={isLocating}
                            className={`flex-1 rounded-xl border border-primary-500 px-4 py-3 items-center active:opacity-80 ${
                                isLocating ? "opacity-60" : ""
                            }`}
                        >
                            {isLocating ? (
                                <ActivityIndicator color={colors.primary[500]} />
                            ) : (
                                <Text className="text-sm font-semibold text-primary-500">
                                    Use Current
                                </Text>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={confirmLocation}
                            disabled={isResolvingAddress}
                            className={`flex-1 rounded-xl bg-primary-500 px-4 py-3 items-center active:opacity-80 ${
                                isResolvingAddress ? "opacity-60" : ""
                            }`}
                        >
                            <Text className="text-sm font-semibold text-white">
                                Confirm
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
