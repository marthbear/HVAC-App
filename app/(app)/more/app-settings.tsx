import { useTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppSettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [jobReminders, setJobReminders] = useState(true);
  const [scheduleChanges, setScheduleChanges] = useState(true);

  // Display settings
  const [compactView, setCompactView] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Location settings
  const [locationServices, setLocationServices] = useState(true);
  const [backgroundLocation, setBackgroundLocation] = useState(false);

  // Data settings
  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ],
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setPushNotifications(true);
            setEmailNotifications(true);
            setSmsNotifications(false);
            setJobReminders(true);
            setScheduleChanges(true);
            if (isDark) toggleTheme();
            setCompactView(false);
            setShowMap(true);
            setLocationServices(true);
            setBackgroundLocation(false);
            setAutoSync(true);
            setWifiOnly(false);
            Alert.alert("Success", "Settings reset to default");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notifications
          </Text>

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.primary}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Push Notifications
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Email Notifications
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="chatbox-outline"
                size={22}
                color={theme.primary}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  SMS Notifications
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="alarm-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Job Reminders
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Remind me before scheduled jobs
                </Text>
              </View>
            </View>
            <Switch
              value={jobReminders}
              onValueChange={setJobReminders}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={theme.primary}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Schedule Changes
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Notify when schedule is updated
                </Text>
              </View>
            </View>
            <Switch
              value={scheduleChanges}
              onValueChange={setScheduleChanges}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Display Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Display
          </Text>

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Dark Mode
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="contract-outline"
                size={22}
                color={theme.primary}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Compact View
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="map-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Show Map View
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Display job locations on map
                </Text>
              </View>
            </View>
            <Switch
              value={showMap}
              onValueChange={setShowMap}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Location Services Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Location Services
          </Text>

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="location-outline"
                size={22}
                color={theme.primary}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Location Services
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Allow app to access your location
                </Text>
              </View>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="navigate-circle-outline"
                size={22}
                color={theme.primary}
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Background Location
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Track location while app is in background
                </Text>
              </View>
            </View>
            <Switch
              value={backgroundLocation}
              onValueChange={setBackgroundLocation}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Data & Storage
          </Text>

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Auto Sync
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
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

          <View
            style={[
              styles.settingRow,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="wifi-outline" size={22} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Wi-Fi Only
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Sync only when connected to Wi-Fi
                </Text>
              </View>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
            onPress={handleClearCache}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                Clear Cache
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Language & Region Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Language & Region
          </Text>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="language-outline"
                size={22}
                color={theme.primary}
              />
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                Language
              </Text>
            </View>
            <View style={styles.actionRight}>
              <Text
                style={[styles.actionValue, { color: theme.textSecondary }]}
              >
                English
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textMuted}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                Time Format
              </Text>
            </View>
            <View style={styles.actionRight}>
              <Text
                style={[styles.actionValue, { color: theme.textSecondary }]}
              >
                12-hour
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Advanced Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Advanced
          </Text>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
            onPress={handleResetSettings}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={22} color={theme.error} />
              <Text style={[styles.actionLabel, { color: theme.error }]}>
                Reset Settings
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            App Version 1.0.0
          </Text>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            Build 2025.12.26
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
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
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 4,
  },
});
