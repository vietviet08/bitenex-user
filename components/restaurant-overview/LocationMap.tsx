import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { memo, useCallback, useMemo } from "react";
import { WebView } from "react-native-webview";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

interface LocationMapProps {
    readonly address: string;
    readonly coordinates: {
        latitude: number;
        longitude: number;
    };
}

export const LocationMap = memo(function LocationMap({
    address,
    coordinates,
}: LocationMapProps) {
    const handleGetDirections = useCallback(() => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
        Linking.openURL(url);
    }, [coordinates]);

    const leafletHtml = useMemo(
        () => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false
    }).setView([${coordinates.latitude}, ${coordinates.longitude}], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM'
    }).addTo(map);

    L.marker([${coordinates.latitude}, ${coordinates.longitude}]).addTo(map);
  </script>
</body>
</html>`,
        [coordinates.latitude, coordinates.longitude],
    );

    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Location
            </Text>

            {/* Leaflet Map */}
            <View className="bg-neutral-100 rounded-xl overflow-hidden mb-3">
                <View style={styles.mapContainer}>
                    <WebView
                        source={{ html: leafletHtml }}
                        style={styles.webview}
                        scrollEnabled={false}
                        nestedScrollEnabled={false}
                        javaScriptEnabled
                        originWhitelist={["*"]}
                    />
                </View>
            </View>

            {/* Address */}
            <Text className="text-base text-neutral-600 mb-3">
                {address.replaceAll("\n", ", ")}
            </Text>

            {/* Get Directions Button */}
            <Pressable
                onPress={handleGetDirections}
                className="bg-primary-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
                style={{
                    shadowColor: colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <IconSymbol name="directions" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base">
                    Get Directions
                </Text>
            </Pressable>
        </View>
    );
});

const styles = StyleSheet.create({
    mapContainer: {
        height: 180,
        borderRadius: 12,
        overflow: "hidden",
    },
    webview: {
        flex: 1,
        backgroundColor: "transparent",
    },
});
