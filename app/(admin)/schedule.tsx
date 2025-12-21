import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JOBS } from "@/src/auth/data/jobs";

type EmployeeSchedule = {
  employeeId: string;
  employeeName: string;
  jobs: typeof JOBS;
};

export default function AdminScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Group jobs by employee
  const employeeSchedules: EmployeeSchedule[] = [
    {
      employeeId: "employee-001",
      employeeName: "John Smith",
      jobs: JOBS.filter((job) => job.employeeId === "employee-001"),
    },
    {
      employeeId: "employee-002",
      employeeName: "Sarah Johnson",
      jobs: [],
    },
    {
      employeeId: "employee-003",
      employeeName: "Mike Williams",
      jobs: [],
    },
  ];

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display} ${period}`;
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Team Schedule</Text>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeDay(-1)}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeDay(1)}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Employee Schedules */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {employeeSchedules.map((schedule) => (
          <View key={schedule.employeeId} style={styles.employeeSection}>
            <View style={styles.employeeHeader}>
              <Text style={styles.employeeName}>{schedule.employeeName}</Text>
              <Text style={styles.jobCount}>
                {schedule.jobs.length} {schedule.jobs.length === 1 ? "job" : "jobs"}
              </Text>
            </View>

            {schedule.jobs.length === 0 ? (
              <View style={styles.noJobsContainer}>
                <Text style={styles.noJobsText}>No jobs scheduled</Text>
              </View>
            ) : (
              schedule.jobs.map((job) => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobTimeContainer}>
                    <Text style={styles.jobTime}>
                      {formatHour(job.startTime)} - {formatHour(job.endTime)}
                    </Text>
                  </View>

                  <View style={styles.jobDetails}>
                    <Text style={styles.jobCustomer}>{job.customerName}</Text>
                    <Text style={styles.jobType}>{job.type}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            job.status === "Completed"
                              ? "#34C759"
                              : job.status === "In Progress"
                              ? "#007AFF"
                              : "#FF9500",
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{job.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  todayText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  employeeSection: {
    marginBottom: 24,
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  jobCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  noJobsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  noJobsText: {
    fontSize: 14,
    color: "#999",
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  jobTimeContainer: {
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 2,
    borderRightColor: "#e5e5e5",
    justifyContent: "center",
  },
  jobTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
    width: 60,
  },
  jobDetails: {
    flex: 1,
  },
  jobCustomer: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  jobType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
