import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Mapbox, {
    MapView,
    Camera,
    PointAnnotation,
    ShapeSource,
    LineLayer,
} from "@rnmapbox/maps";
import { IconSymbol } from "@/components/ui/icon-symbol";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

Mapbox.setAccessToken(MAPBOX_TOKEN ?? null);

export interface Location {
    latitude: number;
    longitude: number;
}

export interface MapTrackingViewProps {
    readonly driverLocation: Location;
    readonly deliveryLocation: Location;
    readonly onDriverLocationUpdate?: (location: Location) => void;
    /** When true, map fills entire parent container */
    readonly fullScreen?: boolean;
}

// Helper: convert Location to [lng, lat] for Mapbox
function toCoord(loc: Location): [number, number] {
    return [loc.longitude, loc.latitude];
}

// Compute bounding box for camera
function getBounds(locations: Location[]) {
    let minLat = Infinity,
        maxLat = -Infinity,
        minLng = Infinity,
        maxLng = -Infinity;
    for (const loc of locations) {
        minLat = Math.min(minLat, loc.latitude);
        maxLat = Math.max(maxLat, loc.latitude);
        minLng = Math.min(minLng, loc.longitude);
        maxLng = Math.max(maxLng, loc.longitude);
    }
    return {
        ne: [maxLng, maxLat] as [number, number],
        sw: [minLng, minLat] as [number, number],
    };
}

// Fetch real road route from Mapbox Directions API
async function fetchRoute(
    from: Location,
    to: Location,
): Promise<[number, number][] | null> {
    try {
        const url =
            `https://api.mapbox.com/directions/v5/mapbox/driving/` +
            `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
            `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.[0]?.geometry?.coordinates) {
            return data.routes[0].geometry.coordinates;
        }
        return null;
    } catch {
        return null;
    }
}

export function MapTrackingView({
    driverLocation: initialDriverLocation,
    deliveryLocation,
    onDriverLocationUpdate,
    fullScreen = false,
}: MapTrackingViewProps) {
    const cameraRef = useRef<Camera>(null);
    const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

    // Fetch real road route when driver location changes
    const updateRoute = useCallback(
        async (driver: Location) => {
            const coords = await fetchRoute(driver, deliveryLocation);
            if (coords) {
                setRouteCoords(coords);
            } else {
                // Fallback: straight line
                setRouteCoords([toCoord(driver), toCoord(deliveryLocation)]);
            }
        },
        [deliveryLocation],
    );

    // Initial route fetch
    useEffect(() => {
        updateRoute(initialDriverLocation);
    }, []);

    // Simulate real-time driver movement along the route
    useEffect(() => {
        const interval = setInterval(() => {
            setDriverLocation((prev) => {
                const latDiff = deliveryLocation.latitude - prev.latitude;
                const lngDiff = deliveryLocation.longitude - prev.longitude;
                const distance = Math.sqrt(
                    latDiff * latDiff + lngDiff * lngDiff,
                );

                // Stop moving when very close
                if (distance < 0.0005) return prev;

                return {
                    latitude: prev.latitude + latDiff * 0.02,
                    longitude: prev.longitude + lngDiff * 0.02,
                };
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [deliveryLocation]);

    // Notify parent + re-fetch route when driver moves
    useEffect(() => {
        onDriverLocationUpdate?.(driverLocation);
        updateRoute(driverLocation);
    }, [driverLocation, onDriverLocationUpdate, updateRoute]);

    // Route GeoJSON from real road data
    const routeGeoJSON = {
        type: "Feature" as const,
        properties: {},
        geometry: {
            type: "LineString" as const,
            coordinates:
                routeCoords.length > 0
                    ? routeCoords
                    : [toCoord(driverLocation), toCoord(deliveryLocation)],
        },
    };

    // Camera bounds - only driver & delivery
    const bounds = getBounds([driverLocation, deliveryLocation]);

    return (
        <View
            style={fullScreen ? styles.fullScreenContainer : styles.container}
        >
            <MapView
                style={styles.map}
                styleURL={Mapbox.StyleURL.Street}
                logoEnabled={false}
                attributionEnabled={false}
                compassEnabled={false}
                scaleBarEnabled={false}
            >
                <Camera
                    ref={cameraRef}
                    bounds={{
                        ne: bounds.ne,
                        sw: bounds.sw,
                        paddingTop: 80,
                        paddingBottom: 80,
                        paddingLeft: 50,
                        paddingRight: 50,
                    }}
                    animationMode="flyTo"
                    animationDuration={1000}
                />

                {/* Real road route line */}
                <ShapeSource id="routeSource" shape={routeGeoJSON}>
                    <LineLayer
                        id="routeLine"
                        style={{
                            lineColor: "#22C55E",
                            lineWidth: 5,
                            lineCap: "round",
                            lineJoin: "round",
                        }}
                    />
                </ShapeSource>

                {/* Driver Marker */}
                <PointAnnotation
                    id="driver"
                    coordinate={toCoord(driverLocation)}
                >
                    <View style={styles.driverMarkerContainer}>
                        <View style={styles.driverMarkerPulse} />
                        <View style={styles.driverMarker}>
                            <View style={styles.driverIcon}>
                                <IconSymbol
                                    name="motorcycle"
                                    size={18}
                                    color="#ffffff"
                                />
                            </View>
                        </View>
                    </View>
                </PointAnnotation>

                {/* Delivery Marker */}
                <PointAnnotation
                    id="delivery"
                    coordinate={toCoord(deliveryLocation)}
                >
                    <View style={styles.markerContainer}>
                        <View style={[styles.marker, styles.deliveryMarker]}>
                            <IconSymbol name="home" size={20} color="#ffffff" />
                        </View>
                    </View>
                </PointAnnotation>
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 280,
        width: "100%",
    },
    fullScreenContainer: {
        flex: 1,
        width: "100%",
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: "center",
    },
    marker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    deliveryMarker: {
        backgroundColor: "#22C55E",
    },
    driverMarkerContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
    },
    driverMarkerPulse: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#22C55E",
        opacity: 0.2,
    },
    driverMarker: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#22C55E",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    driverIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#22C55E",
        alignItems: "center",
        justifyContent: "center",
    },
});
