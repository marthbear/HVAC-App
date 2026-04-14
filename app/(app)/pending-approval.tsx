import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/auth/AuthContext";
import { useRouter } from "expo-router";

export default function PendingApprovalScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="hourglass-outline" size={80} color="#FF9500" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Approval Pending</Text>

          {/* Message */}
          <Text style={styles.message}>
            Your account is waiting for approval from your administrator.
          </Text>

          <Text style={styles.submessage}>
            You'll receive access to the app once your admin approves your
            request.
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
            <View style={styles.infoDivider} />
            <Text style={styles.infoLabel}>
              Please check your email for updates or contact your administrator.
            </Text>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>What happens next?</Text>
            <View style={styles.helpItem}>
              <View style={styles.helpBullet}>
                <Ionicons name="checkmark" size={16} color="#34C759" />
              </View>
              <Text style={styles.helpText}>
                Your administrator will review your request
              </Text>
            </View>
            <View style={styles.helpItem}>
              <View style={styles.helpBullet}>
                <Ionicons name="checkmark" size={16} color="#34C759" />
              </View>
              <Text style={styles.helpText}>
                You'll be notified when your account is approved
              </Text>
            </View>
            <View style={styles.helpItem}>
              <View style={styles.helpBullet}>
                <Ionicons name="checkmark" size={16} color="#34C759" />
              </View>
              <Text style={styles.helpText}>
                Once approved, you can log in and access all features
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  submessage: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  helpSection: {
    width: "100%",
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  helpBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF3B30",
    backgroundColor: "#fff",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
