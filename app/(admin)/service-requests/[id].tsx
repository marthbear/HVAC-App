import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { getServiceRequestById } from "@/src/auth/data/serviceRequests";

/**
 * Service request detail screen.
 *
 * - Loaded via dynamic route: /service-requests/[id]
 * - Header and back button are provided by the Stack navigator
 * - Header title is set dynamically to the customer name
 */
export default function ServiceRequestDetailsScreen() {
  // Read the dynamic route parameter
  const { id } = useLocalSearchParams<{ id: string }>();

  // Access the navigation object to set header options
  const navigation = useNavigation();

  // Load the service request from the shared data source
  const request = id ? getServiceRequestById(id) : undefined;

  /**
   * Update the header title when the request is loaded.
   */
  useEffect(() => {
    if (request) {
      navigation.setOptions({
        title: request.name,
      });
    }
  }, [request, navigation]);

  /**
   * Handle invalid or missing service request
   */
  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Service Request Not Found</Text>
          <Text style={styles.errorText}>
            The requested service request does not exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (request.status) {
      case "Pending":
        return "#FF9500";
      case "Approved":
        return "#34C759";
      case "Rejected":
        return "#FF3B30";
      case "Converted":
        return "#007AFF";
      default:
        return "#8E8E93";
    }
  };

  // Handle phone call
  const handlePhonePress = () => {
    Linking.openURL(`tel:${request.phone}`);
  };

  // Handle email
  const handleEmailPress = () => {
    if (request.email) {
      Linking.openURL(`mailto:${request.email}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{request.status}</Text>
        </View>

        {/* Emergency Badge */}
        {request.isEmergency && (
          <View style={styles.emergencyBadge}>
            <Text style={styles.emergencyText}>EMERGENCY</Text>
          </View>
        )}

        {/* Service Type */}
        <Text style={styles.serviceType}>{request.serviceType}</Text>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{request.description}</Text>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>{request.name}</Text>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.linkValue} onPress={handlePhonePress}>
            {request.phone}
          </Text>
        </View>

        {/* Email Section */}
        {request.email && (
          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.linkValue} onPress={handleEmailPress}>
              {request.email}
            </Text>
          </View>
        )}

        {/* Address Section */}
        {request.address && (
          <View style={styles.section}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>📍 {request.address}</Text>
          </View>
        )}

        {/* Preferred Date Section */}
        {request.preferredDate && (
          <View style={styles.section}>
            <Text style={styles.label}>Preferred Date</Text>
            <Text style={styles.value}>{request.preferredDate}</Text>
          </View>
        )}

        {/* Submitted At Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Submitted</Text>
          <Text style={styles.value}>{formatDate(request.submittedAt)}</Text>
        </View>

        {/* Request ID Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Request ID</Text>
          <Text style={styles.valueSmall}>#{request.id}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the service request detail screen.
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emergencyBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  emergencyText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  serviceType: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#222",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: "#222",
    lineHeight: 24,
  },
  linkValue: {
    fontSize: 18,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  valueSmall: {
    fontSize: 16,
    color: "#666",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#555",
  },
});
