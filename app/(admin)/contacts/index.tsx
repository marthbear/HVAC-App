import { CUSTOMERS } from "@/src/auth/data/customers";
import { useAuth } from "@/src/auth/AuthContext";
import { getEmployeesForContacts, EmployeeContact } from "@/src/services/employeeService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ContactType = "employees" | "customers";

export default function AdminContactsScreen() {
  const router = useRouter();
  const { companyId } = useAuth();
  const [selectedTab, setSelectedTab] = useState<ContactType>("employees");
  const [employees, setEmployees] = useState<EmployeeContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees from centralized service
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const employeesList = await getEmployeesForContacts(companyId);
        setEmployees(employeesList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [companyId]);

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const renderEmployee = ({ item }: { item: EmployeeContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRole}>{item.role || "Technician"}</Text>

        {item.phone && (
          <View style={styles.contactDetail}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.contactDetailText}>{item.phone}</Text>
          </View>
        )}

        <View style={styles.contactDetail}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.contactDetailText}>{item.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCall(item.phone)}
        disabled={!item.phone}
      >
        <Ionicons name="call" size={20} color={item.phone ? "#007AFF" : "#ccc"} />
      </TouchableOpacity>
    </View>
  );

  const renderCustomer = ({ item }: { item: (typeof CUSTOMERS)[0] }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRole}>Customer</Text>

        <View style={styles.contactDetail}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.contactDetailText}>{item.phone}</Text>
        </View>

        <View style={styles.contactDetail}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.contactDetailText}>{item.address}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCall(item.phone)}
      >
        <Ionicons name="call" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>No employees found</Text>
      <Text style={styles.emptyStateSubtext}>
        Employees will appear here once they join your company
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Contacts</Text>
        <TouchableOpacity
          onPress={() => router.push("/(admin)/contacts/new-contact")}
        >
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "employees" && styles.tabActive]}
          onPress={() => setSelectedTab("employees")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "employees" && styles.tabTextActive,
            ]}
          >
            Employees ({employees.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "customers" && styles.tabActive]}
          onPress={() => setSelectedTab("customers")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "customers" && styles.tabTextActive,
            ]}
          >
            Customers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      {selectedTab === "employees" ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading employees...</Text>
          </View>
        ) : employees.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={employees}
            renderItem={renderEmployee}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        <FlatList
          data={CUSTOMERS}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
    color: "#000",
  },
  contactRole: {
    fontSize: 13,
    color: "#999",
    marginBottom: 8,
  },
  contactDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  contactDetailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
