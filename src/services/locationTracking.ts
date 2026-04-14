import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/src/config/firebase";
import { Platform } from "react-native";

const LOCATION_TASK_NAME = "background-location-task";
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

// Store the current user ID for the background task
let currentUserId: string | null = null;

/**
 * Define the background location task
 * This runs even when the app is in the background
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }

  if (!currentUserId) {
    console.log("No user ID set for location tracking");
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (locations && locations.length > 0) {
    const location = locations[0];
    await updateEmployeeLocation(currentUserId, location);
  }
});

/**
 * Update employee location in Firestore
 */
async function updateEmployeeLocation(
  userId: string,
  location: Location.LocationObject
): Promise<void> {
  try {
    // Get address from coordinates (reverse geocoding)
    let address = "Unknown";
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (result) {
        address = [result.street, result.city, result.region]
          .filter(Boolean)
          .join(", ");
      }
    } catch (geocodeError) {
      console.log("Geocoding failed, using coordinates only");
    }

    // Update user document with current location
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currentLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
        accuracy: location.coords.accuracy,
        timestamp: Timestamp.fromMillis(location.timestamp),
      },
      locationUpdatedAt: Timestamp.now(),
    });

    console.log("Location updated for user:", userId);
  } catch (error) {
    console.error("Failed to update location:", error);
  }
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    // Request foreground permission first
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      console.log("Foreground location permission denied");
      return false;
    }

    // Request background permission
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== "granted") {
      console.log("Background location permission denied");
      // Still return true as we can use foreground location
      return true;
    }

    return true;
  } catch (error) {
    console.error("Error requesting location permissions:", error);
    return false;
  }
}

/**
 * Check if location permissions are granted
 */
export async function hasLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const { status: foregroundStatus } =
    await Location.getForegroundPermissionsAsync();
  const { status: backgroundStatus } =
    await Location.getBackgroundPermissionsAsync();

  return {
    foreground: foregroundStatus === "granted",
    background: backgroundStatus === "granted",
  };
}

/**
 * Start background location tracking
 * Called when employee clocks in
 */
export async function startLocationTracking(userId: string): Promise<boolean> {
  try {
    currentUserId = userId;

    // Check if already tracking
    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    if (isTracking) {
      console.log("Location tracking already started");
      return true;
    }

    // Check permissions
    const permissions = await hasLocationPermissions();
    if (!permissions.foreground) {
      const granted = await requestLocationPermissions();
      if (!granted) {
        console.log("Location permissions not granted");
        return false;
      }
    }

    // Get initial location immediately
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await updateEmployeeLocation(userId, currentLocation);

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_UPDATE_INTERVAL,
      distanceInterval: 100, // Update if moved 100 meters
      deferredUpdatesInterval: LOCATION_UPDATE_INTERVAL,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "HVAC Pro - Location Active",
        notificationBody: "Tracking your location while clocked in",
        notificationColor: "#2563eb",
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.AutomotiveNavigation,
    });

    console.log("Background location tracking started for user:", userId);
    return true;
  } catch (error) {
    console.error("Failed to start location tracking:", error);
    return false;
  }
}

/**
 * Stop background location tracking
 * Called when employee clocks out
 */
export async function stopLocationTracking(): Promise<void> {
  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("Background location tracking stopped");
    }

    currentUserId = null;
  } catch (error) {
    console.error("Failed to stop location tracking:", error);
  }
}

/**
 * Check if location tracking is currently active
 */
export async function isLocationTrackingActive(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch {
    return false;
  }
}

/**
 * Get current location once (for manual refresh)
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const permissions = await hasLocationPermissions();
    if (!permissions.foreground) {
      return null;
    }

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch (error) {
    console.error("Failed to get current location:", error);
    return null;
  }
}

/**
 * Get current location and update Firestore
 */
export async function refreshLocation(userId: string): Promise<boolean> {
  try {
    const location = await getCurrentLocation();
    if (location) {
      await updateEmployeeLocation(userId, location);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to refresh location:", error);
    return false;
  }
}
