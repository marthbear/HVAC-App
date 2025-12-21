import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { JOBS, Job } from "@/src/auth/data/jobs";

/**
 * All Jobs screen.
 *
 * Shows a complete list of all jobs assigned to the employee.
 */
export default function AllJobsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Filter jobs to show all jobs assigned to the current employee
  const allJobs = JOBS.filter((job) => job.employeeId === user?.id);

  // Group jobs by status
  const scheduledJobs = allJobs.filter((job) => job.status === "Scheduled");
  const inProgressJobs = allJobs.filter((job) => job.status === "In Progress");
  const completedJobs = allJobs.filter((job) => job.status === "Completed");

  const renderJob = ({ item }: { item: Job }) => {
    // Get status color
    const getStatusColor = () => {
      switch (item.status) {
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
          <Text style={styles.jobSubtitle}>
            {new Date(item.date).toLocaleDateString()} • {item.startTime}:00 - {item.endTime}:00
          </Text>
        </View>
        <Text style={[styles.jobStatus, { color: getStatusColor() }]}>
          {item.status}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, jobs: Job[], count: number) => {
    if (jobs.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={[1]} // Dummy data to render the sections
        keyExtractor={() => "sections"}
        renderItem={() => (
          <View style={styles.container}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Total Jobs</Text>
              <Text style={styles.summaryCount}>{allJobs.length}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>In Progress</Text>
                  <Text style={[styles.summaryValue, { color: "#007AFF" }]}>
                    {inProgressJobs.length}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Scheduled</Text>
                  <Text style={[styles.summaryValue, { color: "#34C759" }]}>
                    {scheduledJobs.length}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Completed</Text>
                  <Text style={[styles.summaryValue, { color: "#666" }]}>
                    {completedJobs.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Jobs by Status */}
            {renderSection("In Progress", inProgressJobs, inProgressJobs.length)}
            {renderSection("Scheduled", scheduledJobs, scheduledJobs.length)}
            {renderSection("Completed", completedJobs, completedJobs.length)}

            {/* Empty State */}
            {allJobs.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No jobs assigned</Text>
                <Text style={styles.emptyStateSubtext}>You have no jobs at this time</Text>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  container: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  summaryCount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  countBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  jobSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  jobStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    padding: 60,
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
