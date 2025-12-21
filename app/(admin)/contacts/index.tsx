import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CUSTOMERS } from "@/src/auth/data/customers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type ContactType = "employees" | "customers";

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
};

export default function AdminContactsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<ContactType>("employees");

  // Mock employee data
  const employees: Employee[] = [
    {
      id: "employee-001",
      name: "John Smith",
      phone: "(804) 555-0101",
      email: "john.smith@hvac.com",
      role: "Senior Technician",
    },
    {
      id: "employee-002",
      name: "Sarah Johnson",
      phone: "(804) 555-0102",
      email: "sarah.johnson@hvac.com",
      role: "Technician",
    },
    {
      id: "employee-003",
      name: "Mike Williams",
      phone: "(804) 555-0103",
      email: "mike.williams@hvac.com",
      role: "Junior Technician",
    },
    {
      id: "employee-004",
      name: "Emily Davis",
      phone: "(804) 555-0104",
      email: "emily.davis@hvac.com",
      role: "Lead Technician",
    },
  ];

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRole}>{item.role}</Text>

        <View style={styles.contactDetail}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.contactDetailText}>{item.phone}</Text>
        </View>

        <View style={styles.contactDetail}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.contactDetailText}>{item.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.callButton}>
        <Ionicons name="call" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderCustomer = ({ item }: { item: typeof CUSTOMERS[0] }) => (
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

      <TouchableOpacity style={styles.callButton}>
        <Ionicons name="call" size={20} color="#007AFF" />
      </TouchableOpacity>
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
          style={[
            styles.tab,
            selectedTab === "employees" && styles.tabActive,
          ]}
          onPress={() => setSelectedTab("employees")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "employees" && styles.tabTextActive,
            ]}
          >
            Employees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "customers" && styles.tabActive,
          ]}
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
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
});
