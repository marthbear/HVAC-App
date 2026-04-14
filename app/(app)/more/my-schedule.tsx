import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/auth/AuthContext";

type Job = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  address: string;
  serviceType: string;
  status: "Scheduled" | "In Progress" | "Completed";
  priority: "Normal" | "Urgent";
  notes?: string;
};

export default function MyScheduleScreen() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "week" | "month">("week");

  // Sample jobs data
  const jobs: Job[] = [
    {
      id: "1",
      date: "2024-12-28",
      startTime: "9:00 AM",
      endTime: "11:00 AM",
      customerName: "Johnson Residence",
      address: "123 Oak Street, Springfield",
      serviceType: "AC Maintenance",
      status: "Scheduled",
      priority: "Normal",
      notes: "Annual checkup, customer prefers morning appointments",
    },
    {
      id: "2",
      date: "2024-12-28",
      startTime: "1:00 PM",
      endTime: "3:00 PM",
      customerName: "Smith Commercial",
      address: "456 Business Park Dr, Springfield",
      serviceType: "Heating Repair",
      status: "Scheduled",
      priority: "Urgent",
    },
    {
      id: "3",
      date: "2024-12-29",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      customerName: "Davis Family",
      address: "789 Maple Ave, Springfield",
      serviceType: "System Installation",
      status: "Scheduled",
      priority: "Normal",
    },
    {
      id: "4",
      date: "2024-12-30",
      startTime: "8:00 AM",
      endTime: "10:00 AM",
      customerName: "Williams Apartment",
      address: "321 Pine Street #4B, Springfield",
      serviceType: "AC Repair",
      status: "Scheduled",
      priority: "Urgent",
      notes: "No cooling, emergency service",
    },
    {
      id: "5",
      date: "2024-12-30",
      startTime: "2:00 PM",
      endTime: "4:00 PM",
      customerName: "Brown Office",
      address: "654 Corporate Blvd, Springfield",
      serviceType: "Duct Cleaning",
      status: "Scheduled",
      priority: "Normal",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group jobs by date
  const groupedJobs = jobs.reduce((acc, job) => {
    if (!acc[job.date]) {
      acc[job.date] = [];
    }
    acc[job.date].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  const sortedDates = Object.keys(groupedJobs).sort();

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "Scheduled":
        return "#007AFF";
      case "In Progress":
        return "#FF9500";
      case "Completed":
        return "#34C759";
      default:
        return "#999";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.header}>My Schedule</Text>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === "all" && styles.filterTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "week" && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter("week")}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === "week" && styles.filterTabTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "month" && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter("month")}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === "month" && styles.filterTabTextActive,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="briefcase-outline" size={24} color="#007AFF" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{jobs.length}</Text>
              <Text style={styles.summaryLabel}>Scheduled Jobs</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>
                {jobs.filter((j) => j.priority === "Urgent").length}
              </Text>
              <Text style={styles.summaryLabel}>Urgent</Text>
            </View>
          </View>
        </View>

        {/* Jobs Grouped by Date */}
        {sortedDates.map((date) => (
          <View key={date} style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Ionicons name="calendar" size={18} color="#007AFF" />
              <Text style={styles.dateTitle}>{formatDate(date)}</Text>
              <Text style={styles.dateCount}>
                {groupedJobs[date].length} {groupedJobs[date].length === 1 ? "job" : "jobs"}
              </Text>
            </View>

            {groupedJobs[date].map((job) => (
              <View key={job.id} style={styles.jobCard}>
                {/* Job Header */}
                <View style={styles.jobHeader}>
                  <View style={styles.jobTimeContainer}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.jobTime}>
                      {job.startTime} - {job.endTime}
                    </Text>
                  </View>
                  {job.priority === "Urgent" && (
                    <View style={styles.urgentBadge}>
                      <Ionicons name="alert-circle" size={14} color="#FF3B30" />
                      <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                  )}
                </View>

                {/* Customer Info */}
                <Text style={styles.customerName}>{job.customerName}</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.addressText}>{job.address}</Text>
                </View>

                {/* Service Type */}
                <View style={styles.serviceRow}>
                  <Ionicons name="construct-outline" size={14} color="#007AFF" />
                  <Text style={styles.serviceType}>{job.serviceType}</Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(job.status) + "20" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(job.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(job.status) },
                    ]}
                  >
                    {job.status}
                  </Text>
                </View>

                {/* Notes */}
                {job.notes && (
                  <View style={styles.notesContainer}>
                    <Ionicons name="information-circle-outline" size={14} color="#666" />
                    <Text style={styles.notesText}>{job.notes}</Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="call-outline" size={18} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="navigate-outline" size={18} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#34C759" />
                    <Text style={[styles.actionButtonText, { color: "#34C759" }]}>
                      Start
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {jobs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Jobs Scheduled</Text>
            <Text style={styles.emptyStateText}>
              You don't have any upcoming jobs at the moment.
            </Text>
          </View>
        )}
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
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: "#fff",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterTabTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    color: "#000",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  dateCount: {
    fontSize: 13,
    color: "#666",
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  jobTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
