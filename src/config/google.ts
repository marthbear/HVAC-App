/**
 * Google Cloud Platform configuration
 *
 * Contains API keys and configuration for Google services used in the app.
 */

export const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";

if (!GOOGLE_PLACES_API_KEY) {
  console.warn(
    "Google Places API key not found. Address autocomplete will not work."
  );
}
