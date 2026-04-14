import React, { useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/auth/AuthContext";
import { useTheme } from "@/src/theme/ThemeContext";
import { JOBS, Job } from "@/src/auth/data/jobs";
import {
  clockIn,
  clockOut,
  subscribeToShiftStatus,
  getWeeklyHours,
  ShiftStatus,
} from "@/src/services/timeTracking";
import {
  startLocationTracking,
  stopLocationTracking,
  requestLocationPermissions,
  hasLocationPermissions,
} from "@/src/services/locationTracking";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>({
    isClockedIn: false,
    currentShiftId: null,
    clockInTime: null,
  });
  const [hoursWorked, setHoursWorked] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Filter jobs to show only those assigned to the current employee
  const openJobs = JOBS.filter(
    (job) => job.employeeId === user?.id && job.status !== "Completed"
  );

  // Subscribe to shift status and load weekly hours
  useEffect(() => {
    if (!user?.id) return;

    const loadWeeklyHours = async () => {
      const hours = await getWeeklyHours(user.id);
      setHoursWorked(hours);
    };

    loadWeeklyHours();

    const unsubscribe = subscribeToShiftStatus(user.id, (status) => {
      setShiftStatus(status);
      // Refresh weekly hours when status changes
      loadWeeklyHours();
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Update elapsed time while clocked in
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

  const handleClockToggle = async () => {
    if (!user?.id) return;

    if (shiftStatus.isClockedIn) {
      // Clock out
      const hours = Math.floor(elapsedTime / 3600);
      const minutes = Math.floor((elapsedTime % 3600) / 60);
      Alert.alert(
        "Clock Out",
        `You worked for ${hours}h ${minutes}m. Clock out now?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clock Out",
            onPress: async () => {
              setIsLoading(true);
              try {
                await stopLocationTracking();
                await clockOut(user.id);
              } catch (error) {
                console.error("Error clocking out:", error);
                Alert.alert("Error", "Failed to clock out");
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Clock in
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
                  await proceedWithClockIn();
                }
              },
            },
          ]
        );
        return;
      }

      await proceedWithClockIn();
    }
  };

  const proceedWithClockIn = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await clockIn(user.id);
      await startLocationTracking(user.id);
    } catch (error) {
      console.error("Error clocking in:", error);
      Alert.alert("Error", "Failed to clock in");
    } finally {
      setIsLoading(false);
    }
  };

  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={[styles.jobCard, { backgroundColor: theme.surface }]}
      onPress={() => {
        router.push({
          pathname: "/(app)/dashboard/[id]",
          params: { id: item.id },
        });
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.jobTitle, { color: theme.text }]}>
          {item.type} - {item.customerName}
        </Text>
        <Text style={[styles.jobLocation, { color: theme.textSecondary }]}>
          {new Date(item.date).toLocaleDateString()} • {item.startTime}:00 -{" "}
          {item.endTime}:00
        </Text>
      </View>
      <Text
        style={[
          styles.jobStatus,
          {
            color:
              item.status === "In Progress"
                ? "#007AFF"
                : item.status === "Scheduled"
                ? "#34C759"
                : "#FF9500",
          },
        ]}
      >
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Clock In/Out Card */}
      <TouchableOpacity
        style={[
          styles.clockCard,
          { backgroundColor: shiftStatus.isClockedIn ? "#34C759" : "#FF3B30" },
        ]}
        onPress={handleClockToggle}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <Text style={styles.clockText}>
              {shiftStatus.isClockedIn ? "Clocked In" : "Clocked Out"}
            </Text>
            {shiftStatus.isClockedIn && (
              <View style={styles.clockElapsed}>
                <Ionicons name="time" size={16} color="#fff" />
                <Text style={styles.clockElapsedText}>{formatElapsedTime()}</Text>
              </View>
            )}
            <Text style={styles.clockSubText}>
              Tap to {shiftStatus.isClockedIn ? "Clock Out" : "Clock In"}
            </Text>
            {shiftStatus.isClockedIn && (
              <View style={styles.locationIndicator}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={styles.locationText}>Location tracking active</Text>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Timecard */}
      <View style={[styles.timecard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.timeTitle, { color: theme.textSecondary }]}>This Week</Text>
        <Text style={[styles.timeValue, { color: theme.primary }]}>
          {hoursWorked.toFixed(1)} hrs
        </Text>
      </View>

      {/* Open Work */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Open Work</Text>
        <TouchableOpacity onPress={() => router.push("/(app)/dashboard/all-jobs")}>
          <Text style={[styles.sectionLink, { color: theme.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {openJobs.length > 0 ? (
        <FlatList
          data={openJobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No open jobs
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.textMuted }]}>
            All caught up!
          </Text>
        </View>
      )}

      {/* Invoices Section */}
      <View style={[styles.invoiceCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.invoiceTitle, { color: theme.text }]}>Invoices</Text>

        <View style={styles.invoiceRow}>
          <View style={styles.invoiceColumn}>
            <Text style={[styles.invoiceLabel, { color: theme.textSecondary }]}>
              Collected
            </Text>
            <Text style={[styles.invoiceAmount, { color: "#16a34a" }]}>$0.00</Text>
          </View>

          <View style={styles.invoiceColumn}>
            <Text style={[styles.invoiceLabel, { color: theme.textSecondary }]}>
              Uncollected
            </Text>
            <Text style={[styles.invoiceAmount, { color: "#dc2626" }]}>$0.00</Text>
          </View>
        </View>
      </View>

      {/* Jobs Graph Section */}
      <View style={[styles.jobsgraphCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.jobsgraphTitle, { color: theme.text }]}>
          Jobs Completed This Week
        </Text>

        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                data: [0, 0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: theme.surface,
            backgroundGradientFrom: theme.surface,
            backgroundGradientTo: theme.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => theme.text,
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#007AFF",
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            alignSelf: "center",
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  clockCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    minHeight: 140,
  },
  clockText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  clockElapsed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  clockElapsedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  clockSubText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
  },
  locationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  timecard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  timeValue: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
  },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  sectionLink: {
    fontSize: 14,
  },
  jobCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  jobLocation: {
    fontSize: 14,
    marginTop: 3,
  },
  jobStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
  invoiceCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  invoiceColumn: {
    alignItems: "center",
    flex: 1,
  },
  invoiceLabel: {},
  invoiceAmount: {
    fontSize: 24,
    fontWeight: "700",
  },
  jobsgraphCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobsgraphTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});
