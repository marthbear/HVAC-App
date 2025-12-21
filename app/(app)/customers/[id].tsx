import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { getCustomerById } from "../../../src/auth/data/customers";

/**
 * Customer detail screen.
 *
 * - Loaded via dynamic route: /customers/[id]
 * - Header and back button are provided by the Stack navigator
 * - Header title is set dynamically to the customer's name
 */
export default function CustomerDetailsScreen() {
  // Read the dynamic route parameter
  const { id } = useLocalSearchParams<{ id: string }>();

  // Access the navigation object to set header options
  const navigation = useNavigation();

  // Load the customer from the shared data source
  const customer = id ? getCustomerById(id) : undefined;

  /**
   * Update the header title when the customer is loaded.
   */
  useEffect(() => {
    if (customer) {
      navigation.setOptions({
        title: customer.name,
      });
    }
  }, [customer, navigation]);

  /**
   * Handle invalid or missing customer
   */
  if (!customer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Customer Not Found</Text>
          <Text style={styles.errorText}>
            The requested customer does not exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Customer name shown as content */}
        <Text style={styles.name}>{customer.name}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{customer.address}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{customer.phone}</Text>

        {/* Future sections */}
      </View>
    </SafeAreaView>
  );
}

/**
 * Styles for the customer detail screen.
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    color: "#666",
  },
  value: {
    fontSize: 16,
    marginTop: 4,
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
