import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function MoreScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "My Profile",
      subtitle: "View and edit your profile",
      onPress: () => {},
    },
    {
      icon: "time-outline",
      title: "Time Tracking",
      subtitle: "View your hours and timesheet",
      onPress: () => {},
    },
    {
      icon: "calendar-outline",
      title: "My Schedule",
      subtitle: "View your upcoming jobs",
      onPress: () => {},
    },
    {
      icon: "settings-outline",
      title: "App Settings",
      subtitle: "Notifications, display, and more",
      onPress: () => {},
    },
    {
      icon: "document-text-outline",
      title: "My Reports",
      subtitle: "View your performance stats",
      onPress: () => {},
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help or contact support",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.header}>More</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color="#007AFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || "Employee"}
            </Text>
            <Text style={styles.profileRole}>Field Technician</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Employee</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color="#007AFF" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 16,
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#34C759",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 8,
  },
});