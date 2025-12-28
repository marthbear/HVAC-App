import React from "react";
import { Platform, TextInput, StyleSheet } from "react-native";
import { GOOGLE_PLACES_API_KEY } from "@/src/config/google";

// Import appropriate library based on platform
let GooglePlacesAutocomplete: any;
let Autocomplete: any;

if (Platform.OS === "web") {
  // Web-specific autocomplete
  Autocomplete = require("react-google-autocomplete").default;
} else {
  // Mobile (iOS/Android) autocomplete
  GooglePlacesAutocomplete =
    require("react-native-google-places-autocomplete").GooglePlacesAutocomplete;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (address: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: any;
}

/**
 * Address autocomplete component using Google Places API.
 *
 * Provides address suggestions as the user types, allowing them to select
 * from a dropdown list of valid addresses. Integrates with form state
 * using controlled component pattern.
 *
 * @param value - Current address value (controlled)
 * @param onChangeText - Callback when user types
 * @param onSelectAddress - Callback when user selects from dropdown
 * @param placeholder - Placeholder text for input
 * @param multiline - Allow multiline input
 * @param style - Additional styles for the input field
 */
export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectAddress,
  placeholder = "123 Main St, City, State",
  multiline = false,
  style,
}: AddressAutocompleteProps) {
  // On web, use react-google-autocomplete
  if (Platform.OS === "web") {
    // Use controlled TextInput for web to avoid API errors on single character
    // Google Places autocomplete for web will be triggered when user selects
    return (
      <div style={{ position: "relative", width: "100%" }}>
        <Autocomplete
          apiKey={GOOGLE_PLACES_API_KEY}
          onPlaceSelected={(place: any) => {
            if (place.formatted_address) {
              onSelectAddress(place.formatted_address);
            }
          }}
          onChange={(e: any) => {
            onChangeText(e.target.value);
          }}
          value={value}
          options={{
            types: ["address"],
            componentRestrictions: { country: "us" },
          }}
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            color: "#000",
            height: multiline ? "80px" : "56px",
            width: "100%",
            border: "1px solid #ddd",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            ...style,
          }}
          placeholder={placeholder}
          debounce={500}
        />
      </div>
    );
  }

  // On mobile (iOS/Android), use Google Places Autocomplete
  return (
    <GooglePlacesAutocomplete
      placeholder={placeholder}
      onPress={(data: { description: string }, details: any = null) => {
        // When user selects an address from dropdown
        onSelectAddress(data.description);
      }}
      query={{
        key: GOOGLE_PLACES_API_KEY,
        language: "en",
        components: "country:us", // Restrict to US addresses
      }}
      fetchDetails={false} // Don't fetch full place details to save API costs
      textInputProps={{
        value: value,
        onChangeText: onChangeText,
        placeholderTextColor: "#888",
        multiline: multiline,
        autoCapitalize: "words",
      }}
      styles={{
        textInput: {
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 16,
          fontSize: 16,
          color: "#000",
          height: multiline ? 80 : 56,
          ...(style || {}),
        },
        listView: {
          backgroundColor: "#fff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#ddd",
          marginTop: 5,
          position: "absolute",
          top: multiline ? 85 : 61,
          zIndex: 1000,
        },
        row: {
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        },
        description: {
          fontSize: 14,
          color: "#333",
        },
        loader: {
          padding: 10,
        },
        poweredContainer: {
          display: "none", // Hide "Powered by Google" footer
        },
      }}
      debounce={500} // Wait 500ms after typing stops before making API call
      minLength={2} // Require at least 2 characters before searching
      enablePoweredByContainer={false}
      onFail={(error: any) => {
        console.error("Google Places API Error:", error);
      }}
      requestUrl={{
        useOnPlatform: "all",
      }}
    />
  );
}
