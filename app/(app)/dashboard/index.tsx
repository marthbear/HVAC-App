import React, { useState, useEffect } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { JOBS, Job } from "@/src/auth/data/jobs";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [hoursWorked, setHoursWorked] = useState(32.5);

  // Filter jobs to show only those assigned to the current employee
  const openJobs = JOBS.filter(
    (job) => job.employeeId === user?.id && job.status !== "Completed"
  );

  // Load clock in/out state on component mount
  useEffect(() => {
    loadClockState();
  }, []);

  const loadClockState = async () => {
    try {
      const clockState = await AsyncStorage.getItem("clockedIn");
      if (clockState !== null) {
        setIsClockedIn(clockState === "true");
      }
    } catch (error) {
      console.error("Error loading clock state:", error);
    }
  };

  const handleClockToggle = async () => {
    const newState = !isClockedIn;
    setIsClockedIn(newState);

    try {
      await AsyncStorage.setItem("clockedIn", newState.toString());
      // TODO: Track clock in/out timestamp for hours worked calculation
    } catch (error) {
      console.error("Error saving clock state:", error);
    }
  };

  const renderJob = ({ item }: { item: Job}) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => {
        router.push({
          pathname: "/(app)/dashboard/[id]",
          params: { id: item.id },
        });
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.jobTitle}>{item.type} - {item.customerName}</Text>
        <Text style={styles.jobLocation}>
          {new Date(item.date).toLocaleDateString()} • {item.startTime}:00 - {item.endTime}:00
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Clock In/Out Card */}
      <TouchableOpacity
        style={[
          styles.clockCard,
          { backgroundColor: isClockedIn ? "#34C759" : "#FF3B30" },
        ]}
        onPress={handleClockToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.clockText}>
          {isClockedIn ? "Clocked In" : "Clocked Out"}
        </Text>
        <Text style={styles.clockSubText}>
          Tap to {isClockedIn ? "Clock Out" : "Clock In"}
        </Text>
      </TouchableOpacity>

      {/* Timecard */}
      <View style={styles.timecard}>
        <Text style={styles.timeTitle}>This Week</Text>
        <Text style={styles.timeValue}>{hoursWorked.toFixed(1)} hrs</Text>
      </View>

      {/* Open Work */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Open Work</Text>
        <TouchableOpacity onPress={() => router.push("/(app)/dashboard/all-jobs")}>
          <Text style={styles.sectionLink}>View All</Text>
        </TouchableOpacity>
      </View>

      {openJobs.length > 0 ? (
        <FlatList
          data={openJobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // important so ScrollView handles scrolling
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No open jobs</Text>
          <Text style={styles.emptyStateSubtext}>All caught up!</Text>
        </View>
      )}

      {/* Invoices Section */}
      <View style={styles.invoiceCard}>
        <Text style={styles.invoiceTitle}>Invoices</Text>

        <View style={styles.invoiceRow}>
          <View style={styles.invoiceColumn}>
            <Text style={styles.invoiceLabel}>Collected</Text>
            <Text style={[styles.invoiceAmount, { color: "#16a34a" }]}>$0.00</Text>
          </View>

          <View style={styles.invoiceColumn}>
            <Text style={styles.invoiceLabel}>Uncollected</Text>
            <Text style={[styles.invoiceAmount, { color: "#dc2626" }]}>$0.00</Text>
          </View>
        </View>
      </View>

  {/*Jobs Graph Section*/}
  <View style={styles.jobsgraphCard}>
  <Text style={styles.jobsgraphTitle}>Jobs Completed This Week</Text>

  <LineChart
    data={{
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0, 0], // example job completion data
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // line color
        },
      ],
    }}
    width={screenWidth - 40}
    height={220}
    yAxisLabel=""
    yAxisSuffix=""
    chartConfig={{
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
    backgroundColor: "#f7f7f7",
    padding: 20,
    paddingTop: 60,
  },
  clockCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  clockText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  clockSubText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  timecard: {
    backgroundColor: "#fff",
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
    color: "#555",
    fontWeight: "500",
  },
  timeValue: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
    color: "#007AFF",
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
    color: "#333",
  },
  sectionLink: {
    color: "#007AFF",
    fontSize: 14,
  },
  jobCard: {
    backgroundColor: "#fff",
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
    color: "#222",
  },
  jobLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  jobStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
  invoiceCard: {
    backgroundColor: "#fff",
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
  invoiceLabel: {
    color: "#6b7280",
  },
  invoiceAmount: {
    fontSize: 24,
    fontWeight: "700",
  },
  jobsgraphCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobsgraphTitle:{
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
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
});
