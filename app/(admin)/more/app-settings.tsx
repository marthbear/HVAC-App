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
import { useTheme } from "@/src/theme/ThemeContext";

export default function AppSettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newJobAlerts, setNewJobAlerts] = useState(true);
  const [scheduleUpdates, setScheduleUpdates] = useState(true);

  // Display settings
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
            setPushNotifications(true);
            setEmailNotifications(true);
            setSmsNotifications(false);
            setNewJobAlerts(true);
            setScheduleUpdates(true);
            if (isDark) toggleTheme();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Receive push notifications on this device
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Email Notifications</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbox-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>SMS Notifications</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Receive important alerts via text
                </Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="briefcase-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>New Job Alerts</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Notify when new jobs are assigned
                </Text>
              </View>
            </View>
            <Switch
              value={newJobAlerts}
              onValueChange={setNewJobAlerts}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="calendar-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Schedule Updates</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Notify when schedule changes occur
                </Text>
              </View>
            </View>
            <Switch
              value={scheduleUpdates}
              onValueChange={setScheduleUpdates}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Display Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Display</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Use dark theme throughout the app
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="contract-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Compact View</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Show more items on screen
                </Text>
              </View>
            </View>
            <Switch
              value={compactView}
              onValueChange={setCompactView}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="image-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Show Job Photos</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Display photos in job listings
                </Text>
              </View>
            </View>
            <Switch
              value={showJobPhotos}
              onValueChange={setShowJobPhotos}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data & Storage</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Auto Sync</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Automatically sync data in background
                </Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-offline-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Offline Mode</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Enable offline data access
                </Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearCache}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Clear Cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Language & Region Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Language & Region</Text>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Language</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={[styles.actionValue, { color: theme.textSecondary }]}>English</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Region</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={[styles.actionValue, { color: theme.textSecondary }]}>United States</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Time Format</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={[styles.actionValue, { color: theme.textSecondary }]}>12-hour</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Advanced Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Advanced</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetSettings}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={22} color={theme.error} />
              <Text style={[styles.actionLabel, { color: theme.error }]}>
                Reset Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>App Version 1.0.0</Text>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>Build 2025.12.26</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
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
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  divider: {
    height: 1,
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
  },
  actionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionValue: {
    fontSize: 15,
  },
  infoSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 4,
  },
});
