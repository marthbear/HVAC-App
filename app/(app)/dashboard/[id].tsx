import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { getJobById } from "@/src/auth/data/jobs";

/**
 * Job detail screen.
 *
 * - Loaded via dynamic route: /dashboard/[id]
 * - Header and back button are provided by the Stack navigator
 * - Header title is set dynamically to the job type
 */
export default function JobDetailsScreen() {
  // Read the dynamic route parameter
  const { id } = useLocalSearchParams<{ id: string }>();

  // Access the navigation object to set header options
  const navigation = useNavigation();

  // Load the job from the shared data source
  const job = id ? getJobById(id) : undefined;

  /**
   * Update the header title when the job is loaded.
   */
  useEffect(() => {
    if (job) {
      navigation.setOptions({
        title: job.type,
      });
    }
  }, [job, navigation]);

  /**
   * Handle invalid or missing job
   */
  if (!job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Job Not Found</Text>
          <Text style={styles.errorText}>
            The requested job does not exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for display
  const formattedDate = new Date(job.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format time
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Get status color
  const getStatusColor = () => {
    switch (job.status) {
      case "In Progress":
        return "#007AFF";
      case "Scheduled":
        return "#34C759";
      case "Completed":
        return "#666";
      default:
        return "#FF9500";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>

        {/* Job Type */}
        <Text style={styles.jobType}>{job.type}</Text>

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>{job.customerName}</Text>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>
            {formatTime(job.startTime)} - {formatTime(job.endTime)}
          </Text>
        </View>

        {/* Job ID Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Job ID</Text>
          <Text style={styles.valueSmall}>#{job.id}</Text>
        </View>

        {/* Notes Section (placeholder for future) */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.placeholder}>No notes for this job</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the job detail screen.
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  jobType: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#222",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: "#222",
  },
  valueSmall: {
    fontSize: 16,
    color: "#666",
  },
  placeholder: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#555",
  },
});
