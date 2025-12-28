import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function AppSettingsScreen() {
  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newJobAlerts, setNewJobAlerts] = useState(true);
  const [scheduleUpdates, setScheduleUpdates] = useState(true);

  // Display settings
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [showJobPhotos, setShowJobPhotos] = useState(true);

  // Data settings
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache? This will free up storage space.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // Reset all settings to default
            setPushNotifications(true);
            setEmailNotifications(true);
            setSmsNotifications(false);
            setNewJobAlerts(true);
            setScheduleUpdates(true);
            setDarkMode(false);
            setCompactView(false);
            setShowJobPhotos(true);
            setAutoSync(true);
            setOfflineMode(false);
            Alert.alert("Success", "Settings reset to default");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive push notifications on this device
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbox-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive important alerts via text
                </Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="briefcase-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>New Job Alerts</Text>
                <Text style={styles.settingDescription}>
                  Notify when new jobs are assigned
                </Text>
              </View>
            </View>
            <Switch
              value={newJobAlerts}
              onValueChange={setNewJobAlerts}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="calendar-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Schedule Updates</Text>
                <Text style={styles.settingDescription}>
                  Notify when schedule changes occur
                </Text>
              </View>
            </View>
            <Switch
              value={scheduleUpdates}
              onValueChange={setScheduleUpdates}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Use dark theme throughout the app
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="contract-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Compact View</Text>
                <Text style={styles.settingDescription}>
                  Show more items on screen
                </Text>
              </View>
            </View>
            <Switch
              value={compactView}
              onValueChange={setCompactView}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="image-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Show Job Photos</Text>
                <Text style={styles.settingDescription}>
                  Display photos in job listings
                </Text>
              </View>
            </View>
            <Switch
              value={showJobPhotos}
              onValueChange={setShowJobPhotos}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto Sync</Text>
                <Text style={styles.settingDescription}>
                  Automatically sync data in background
                </Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-offline-outline" size={22} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Offline Mode</Text>
                <Text style={styles.settingDescription}>
                  Enable offline data access
                </Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: "#e5e5e5", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearCache}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color="#007AFF" />
              <Text style={styles.actionLabel}>Clear Cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Language & Region Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Region</Text>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={22} color="#007AFF" />
              <Text style={styles.actionLabel}>Language</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={styles.actionValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={22} color="#007AFF" />
              <Text style={styles.actionLabel}>Region</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={styles.actionValue}>United States</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={22} color="#007AFF" />
              <Text style={styles.actionLabel}>Time Format</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={styles.actionValue}>12-hour</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Advanced Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetSettings}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={22} color="#FF3B30" />
              <Text style={[styles.actionLabel, { color: "#FF3B30" }]}>
                Reset Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>App Version 1.0.0</Text>
          <Text style={styles.infoText}>Build 2025.12.26</Text>
        </View>
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
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  actionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionValue: {
    fontSize: 15,
    color: "#666",
  },
  infoSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  infoText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
});
