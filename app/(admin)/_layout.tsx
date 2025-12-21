import { Tabs, Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useAuth } from "../../src/auth/AuthContext";

/**
 * Admin-only tabs layout.
 */
export default function AdminLayout() {
  const { isLoggedIn, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Prevent redirect while auth state is still loading
  if (isLoading) {
    return null;
  }

  // If not logged in, force back to login
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // Admin-only access guard
  if (!isAdmin) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
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
        name="inbox/index"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="contacts/index"
        options={{
          title: "Contacts",
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

      {/* Hidden screens - not shown in tab bar */}
      <Tabs.Screen
        name="service-requests"
        options={{
          href: null, // Hides from tab bar
          headerShown: true,
          title: "Service Requests",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="close" size={28} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Hide nested routes from tab bar */}
      <Tabs.Screen
        name="inbox/compose-message"
        options={{
          href: null, // Hides from tab bar
        }}
      />

      <Tabs.Screen
        name="contacts/new-contact"
        options={{
          href: null, // Hides from tab bar
        }}
      />
    </Tabs>
  );
}
