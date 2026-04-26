import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/auth/AuthContext";
import { useTheme } from "@/src/theme/ThemeContext";
import {
  clockIn,
  clockOut,
  getShiftStatus,
  getTimeEntries,
  getWeeklyHours,
  subscribeToShiftStatus,
  ShiftStatus,
  TimeEntry,
} from "@/src/services/timeTracking";
import {
  startLocationTracking,
  stopLocationTracking,
  requestLocationPermissions,
  hasLocationPermissions,
} from "@/src/services/locationTracking";
import { Timestamp } from "firebase/firestore";

export default function TimeTrackingScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>({
    isClockedIn: false,
    currentShiftId: null,
    clockInTime: null,
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [entries, hours, permissions] = await Promise.all([
          getTimeEntries(user.id),
          getWeeklyHours(user.id),
          hasLocationPermissions(),
        ]);
        setTimeEntries(entries);
        setWeeklyHours(hours);
        setLocationEnabled(permissions.background);
      } catch (error) {
        console.error("Error loading time tracking data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to shift status changes
    const unsubscribe = subscribeToShiftStatus(user.id, (status) => {
      setShiftStatus(status);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Update elapsed time every second when clocked in
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shiftStatus.isClockedIn && shiftStatus.clockInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor(
          (now.getTime() - shiftStatus.clockInTime!.getTime()) / 1000
        );
        setElapsedTime(diff);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [shiftStatus.isClockedIn, shiftStatus.clockInTime]);

  const handleClockIn = async () => {
    if (!user?.id) return;

    // Request location permissions first
    const permissions = await hasLocationPermissions();
    if (!permissions.background) {
      Alert.alert(
        "Location Permission Required",
        "To track your location while working, please enable background location access.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              const granted = await requestLocationPermissions();
              if (granted) {
                setLocationEnabled(true);
                proceedWithClockIn();
              }
            },
          },
        ]
      );
      return;
    }

    proceedWithClockIn();
  };

  const proceedWithClockIn = async () => {
    if (!user?.id) return;

    setIsClockingIn(true);
    try {
      await clockIn(user.id);

      // Start location tracking
      const locationStarted = await startLocationTracking(user.id);
      if (!locationStarted) {
        console.warn("Failed to start location tracking");
      }

      Alert.alert("Clocked In", "You are now clocked in. Location tracking is active.");
    } catch (error) {
      console.error("Error clocking in:", error);
      Alert.alert("Error", "Failed to clock in. Please try again.");
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = () => {
    Alert.alert(
      "Clock Out",
      `You worked for ${formatElapsedTime(elapsedTime)}. Clock out now?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clock Out",
          onPress: async () => {
            if (!user?.id) return;

            setIsClockingOut(true);
            try {
              // Stop location tracking first
              await stopLocationTracking();

              await clockOut(user.id);

              // Refresh time entries
              const [entries, hours] = await Promise.all([
                getTimeEntries(user.id),
                getWeeklyHours(user.id),
              ]);
              setTimeEntries(entries);
              setWeeklyHours(hours);

              Alert.alert("Clocked Out", "You have been clocked out. Location tracking stopped.");
            } catch (error) {
              console.error("Error clocking out:", error);
              Alert.alert("Error", "Failed to clock out. Please try again.");
            } finally {
              setIsClockingOut(false);
            }
          },
        },
      ]
    );
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["bottom", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading time tracking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysWorked = new Set(
    timeEntries.map((e) => e.clockIn.toDate().toDateString())
  ).size;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  shiftStatus.isClockedIn ? styles.statusDotActive : styles.statusDotInactive,
                ]}
              />
              <Text style={[styles.statusText, { color: theme.text }]}>
                {shiftStatus.isClockedIn ? "Clocked In" : "Clocked Out"}
              </Text>
            </View>
            {shiftStatus.isClockedIn && shiftStatus.clockInTime && (
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={14} color="#10B981" />
                <Text style={styles.locationText}>Tracking</Text>
              </View>
            )}
          </View>

          {shiftStatus.isClockedIn && shiftStatus.clockInTime && (
            <View style={styles.timerSection}>
              <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
                Since {shiftStatus.clockInTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={[styles.timerValue, { color: theme.primary }]}>
                {formatElapsedTime(elapsedTime)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.clockButton,
              shiftStatus.isClockedIn ? styles.clockOutButton : styles.clockInButton,
              (isClockingIn || isClockingOut) && styles.clockButtonDisabled,
            ]}
            onPress={shiftStatus.isClockedIn ? handleClockOut : handleClockIn}
            disabled={isClockingIn || isClockingOut}
          >
            {isClockingIn || isClockingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={shiftStatus.isClockedIn ? "stop-circle" : "play-circle"}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.clockButtonText}>
                  {shiftStatus.isClockedIn ? "Clock Out" : "Clock In"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!locationEnabled && !shiftStatus.isClockedIn && (
            <View style={styles.locationWarning}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={[styles.locationWarningText, { color: theme.textSecondary }]}>
                Background location not enabled
              </Text>
            </View>
          )}
        </View>

        {/* Week Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>This Week</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={24} color={theme.primary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {weeklyHours.toFixed(1)}h
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Hours
                </Text>
              </View>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={24} color={theme.primary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{daysWorked}</Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Days Worked
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Time Entries */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Entries</Text>

          {timeEntries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Ionicons name="time-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No time entries yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Clock in to start tracking your hours
              </Text>
            </View>
          ) : (
            timeEntries.map((entry) => (
              <View key={entry.id} style={[styles.entryCard, { backgroundColor: theme.surface }]}>
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryDate, { color: theme.text }]}>
                    {formatDate(entry.clockIn)}
                  </Text>
                  {entry.totalHours !== null && (
                    <View style={[styles.hoursBadge, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="time" size={14} color={theme.primary} />
                      <Text style={[styles.hoursText, { color: theme.primary }]}>
                        {entry.totalHours.toFixed(1)}h
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.entryTimes}>
                  <View style={styles.timeBlock}>
                    <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Clock In</Text>
                    <Text style={[styles.timeValue, { color: theme.text }]}>
                      {formatTime(entry.clockIn)}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={theme.textMuted} />
                  <View style={styles.timeBlock}>
                    <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Clock Out</Text>
                    <Text style={[styles.timeValue, { color: theme.text }]}>
                      {entry.clockOut ? formatTime(entry.clockOut) : "In Progress"}
                    </Text>
                  </View>
                </View>

                {entry.notes && (
                  <View style={[styles.notesSection, { borderTopColor: theme.borderLight }]}>
                    <Ionicons name="document-text-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                      {entry.notes}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  statusCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotActive: {
    backgroundColor: "#34C759",
  },
  statusDotInactive: {
    backgroundColor: "#999",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  timerSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  clockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  clockInButton: {
    backgroundColor: "#34C759",
  },
  clockOutButton: {
    backgroundColor: "#FF3B30",
  },
  clockButtonDisabled: {
    opacity: 0.7,
  },
  clockButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  locationWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  locationWarningText: {
    fontSize: 13,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: "600",
  },
  hoursBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hoursText: {
    fontSize: 13,
    fontWeight: "600",
  },
  entryTimes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    fontStyle: "italic",
  },
});
