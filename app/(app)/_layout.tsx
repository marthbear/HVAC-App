import { Tabs, useSegments, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/src/auth/AuthContext";

/**
 * Employee-only tabs layout.
 * Admin and Customer roles will use separate layouts.
 */
export default function EmployeeLayout() {
  const segments = useSegments();

  // Hide tab bar when viewing a customer detail screen
  const hideTabBar =
    segments[1] === "customers" && segments.length > 2;

  const { isLoggedIn, isLoading, isEmployee } = useAuth();

  // Prevent redirect while auth state is still loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If not logged in, force back to login
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // Employee-only access guard
  if (!isEmployee) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabBar
          ? { display: "none" }
          : undefined,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

