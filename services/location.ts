/**
 * Location service wrapper
 * Handles GPS permissions and location tracking
 */

import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationWithDetails extends Coordinates {
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface AddressDetails {
  street: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  country: string | null;
  postalCode: string | null;
  formattedAddress: string;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;

  /**
   * Request location permissions
   * Returns true if granted
   */
  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.warn('[Location] Foreground permission denied');
      return false;
    }

    return true;
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<LocationWithDetails | null> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('[Location] Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Start watching location updates
   */
  async startWatching(
    onUpdate: (location: LocationWithDetails) => void,
    options?: {
      accuracy?: Location.Accuracy;
      distanceInterval?: number;
      timeInterval?: number;
    }
  ): Promise<boolean> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    // Stop existing watch if any
    this.stopWatching();

    try {
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy ?? Location.Accuracy.Balanced,
          distanceInterval: options?.distanceInterval ?? 10, // meters
          timeInterval: options?.timeInterval ?? 5000, // ms
        },
        (location) => {
          onUpdate({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          });
        }
      );

      return true;
    } catch (error) {
      console.error('[Location] Failed to start watching:', error);
      return false;
    }
  }

  /**
   * Stop watching location updates
   */
  stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coords: Coordinates): Promise<AddressDetails | null> {
    try {
      const results = await Location.reverseGeocodeAsync(coords);

      if (results.length === 0) return null;

      const address = results[0];
      const parts = [
        address.streetNumber,
        address.street,
        address.district,
        address.city,
        address.region,
      ].filter(Boolean);

      return {
        street: address.street,
        city: address.city,
        district: address.district,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        formattedAddress: parts.join(', ') || 'Unknown location',
      };
    } catch (error) {
      console.error('[Location] Reverse geocode failed:', error);
      return null;
    }
  }

  /**
   * Geocode address string to coordinates
   */
  async geocode(address: string): Promise<Coordinates | null> {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length === 0) return null;

      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    } catch (error) {
      console.error('[Location] Geocode failed:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points (in meters)
   */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

// Export singleton
export const locationService = new LocationService();

export default locationService;
