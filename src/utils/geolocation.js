/**
 * Geolocation utility for retrieving user device coordinates
 * with standardized error handling and high accuracy settings.
 */

export function getGeolocationErrorMessage(error) {
  if (!error) return "Unable to retrieve device location.";
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return "Location permission was denied. Location is mandatory for EMI upfront payment. Please allow location access in your browser settings.";
    case 2: // POSITION_UNAVAILABLE
      return "Location information is unavailable. Please ensure GPS/Location services are enabled on your device.";
    case 3: // TIMEOUT
      return "The request to get your location timed out. Please try again.";
    default:
      return error.message || "An unknown error occurred while retrieving your location.";
  }
}

/**
 * Retrieves the current coordinates of the device.
 * @param {PositionOptions} [options]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, altitude: number | null, timestamp: number }>}
 */
export async function getCurrentCoordinates(options = {}) {
  if (typeof window === "undefined" || !navigator.geolocation) {
    const error = new Error("Geolocation is not supported by your browser. A location-compatible device is required for EMI upfront payment.");
    error.code = "NOT_SUPPORTED";
    throw error;
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || null,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (geoError) => {
        const error = new Error(getGeolocationErrorMessage(geoError));
        error.code = geoError.code;
        error.originalError = geoError;
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}
