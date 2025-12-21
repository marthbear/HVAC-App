import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { CUSTOMERS, Customer } from "@/src/auth/data/customers";


/**
 * Customers screen.
 *
 * Displays a static header and a scrollable list of customers.
 * Tapping a customer navigates to the detail screen.
 */
export default function CustomersScreen() {
  // Access authenticated user info (admin vs employee)
  const { user } = useAuth();

  // Router used to navigate to customer detail screens
  const router = useRouter();

  /**
   * Filter customers based on role.
   *
   * - Admins see all customers
   * - Employees see only their assigned customers
   */
  const visibleCustomers =
  user?.role === "admin"
    ? CUSTOMERS
    : CUSTOMERS.filter(
        (customer) =>
          customer.assignedEmployeeId === user?.id
      );

  /**
   * Renders a single customer card.
   * 
   */
  const renderCustomer = ({ item }: { item: Customer }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // Navigate to customers detail
         router.push({
          pathname: "/(app)/customers/[id]",
          params: { id: item.id },
        });
        }}
      >
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerAddress}>{item.address}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.header}>
        {/* Left spacer  */}
        <View style={styles.side} />

        {/* Centered title */}
        <Text style={styles.title}>Customers</Text>

        {/* Right spacer */}
        <View style={styles.side} />
      </View>

       
        
           
      <FlatList
        data={visibleCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No customers assigned</Text>
            <Text style={styles.emptyStateSubtext}>
              {user?.role === "admin"
                ? "No customers in the system"
                : "You have no assigned customers"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/**
 * Styles for the Customers screen.
 */
const styles = StyleSheet.create({
  
   
   
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  /**
   * Static top header bar.
   */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#ffffff",
  },

  /**
   * Spacer used to keep the title centered.
   */
  side: {
    width: 32,
  },

  /**
   * Header title text.
   */
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },

  /**
   * Padding for the FlatList content.
   */
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },

  /**
   * Individual customer card.
   */
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },

  /**
   * Customer name text.
   */
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  /**
   * Customer address text.
   */
  customerAddress: {
    fontSize: 14,
    color: "#555",
  },

  /**
   * Empty state container.
   */
  emptyState: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
});

