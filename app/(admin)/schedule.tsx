import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JOBS } from "@/src/auth/data/jobs";

type EmployeeSchedule = {
  employeeId: string;
  employeeName: string;
  jobs: typeof JOBS;
};

type ViewMode = "list" | "timeline";

export default function AdminScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const hourScrollRef = useRef<ScrollView>(null);

  // Filter jobs by selected date
  const filteredJobs = JOBS.filter((job) => {
    const jobDate = new Date(job.date);
    return jobDate.toDateString() === selectedDate.toDateString();
  });

  // Group jobs by employee
  const employeeSchedules: EmployeeSchedule[] = [
    {
      employeeId: "employee-001",
      employeeName: "John Smith",
      jobs: filteredJobs.filter((job) => job.employeeId === "employee-001"),
    },
    {
      employeeId: "employee-002",
      employeeName: "Sarah Johnson",
      jobs: filteredJobs.filter((job) => job.employeeId === "employee-002"),
    },
    {
      employeeId: "employee-003",
      employeeName: "Mike Williams",
      jobs: filteredJobs.filter((job) => job.employeeId === "employee-003"),
    },
  ];

  // Timeline constants
  const HOUR_HEIGHT = 60; // pixels per hour
  const TIMELINE_HEIGHT = HOUR_HEIGHT * 24; // 1440px total
  const HOUR_LABEL_WIDTH = 80; // Width for hour labels column

  // Calculate employee column width to fill screen
  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - HOUR_LABEL_WIDTH - 40; // Subtract hour labels and padding
  const EMPLOYEE_COLUMN_WIDTH = Math.max(
    availableWidth / employeeSchedules.length,
    150 // Minimum width per column
  );

  // Employee color mapping
  const EMPLOYEE_COLORS: Record<string, string> = {
    "employee-001": "#FF6B6B", // John Smith - Red
    "employee-002": "#4ECDC4", // Sarah Johnson - Teal
    "employee-003": "#95E1D3", // Mike Williams - Mint
  };

  const getEmployeeColor = (employeeId: string): string => {
    return EMPLOYEE_COLORS[employeeId] || "#999";
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display} ${period}`;
  };

  const syncScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    hourScrollRef.current?.scrollTo({ y: offsetY, animated: false });
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

      {/* View Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === "list" && styles.tabActive]}
          onPress={() => setViewMode("list")}
        >
          <Text
            style={[
              styles.tabText,
              viewMode === "list" && styles.tabTextActive,
            ]}
          >
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === "timeline" && styles.tabActive]}
          onPress={() => setViewMode("timeline")}
        >
          <Text
            style={[
              styles.tabText,
              viewMode === "timeline" && styles.tabTextActive,
            ]}
          >
            Schedule
          </Text>
        </TouchableOpacity>
      </View>

      {/* Employee Schedules */}
      {viewMode === "list" && (
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
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <View style={styles.timelineContainer}>
          {/* Employee Names Header */}
          <View style={styles.employeeHeaderRow}>
            <View style={styles.hourLabelPlaceholder} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
            >
              <View
                style={[
                  styles.employeeNamesRow,
                  { width: EMPLOYEE_COLUMN_WIDTH * employeeSchedules.length },
                ]}
              >
                {employeeSchedules.map((schedule) => (
                  <View
                    key={schedule.employeeId}
                    style={[
                      styles.timelineEmployeeHeader,
                      { width: EMPLOYEE_COLUMN_WIDTH },
                    ]}
                  >
                    <Text style={styles.timelineEmployeeName}>
                      {schedule.employeeName}
                    </Text>
                    <Text style={styles.timelineJobCount}>
                      {schedule.jobs.length}{" "}
                      {schedule.jobs.length === 1 ? "job" : "jobs"}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Timeline Grid */}
          <View style={styles.timelineGrid}>
            {/* Hour Labels Column */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              ref={hourScrollRef}
              scrollEnabled={false}
            >
              <View style={styles.hourLabelsColumn}>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <View
                    key={hour}
                    style={[styles.hourLabel, { height: HOUR_HEIGHT }]}
                  >
                    <Text style={styles.hourLabelText}>
                      {formatHour(hour)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Employee Columns */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={syncScroll}
              >
                <View
                  style={[
                    styles.employeeColumnsContainer,
                    { width: EMPLOYEE_COLUMN_WIDTH * employeeSchedules.length },
                  ]}
                >
                  {employeeSchedules.map((schedule) => (
                    <View
                      key={schedule.employeeId}
                      style={[
                        styles.employeeColumn,
                        {
                          width: EMPLOYEE_COLUMN_WIDTH,
                          height: TIMELINE_HEIGHT,
                        },
                      ]}
                    >
                      {/* Hour Grid Lines */}
                      {Array.from({ length: 24 }, (_, i) => i).map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.hourGridLine,
                            { top: i * HOUR_HEIGHT },
                          ]}
                        />
                      ))}

                      {/* Job Blocks */}
                      {schedule.jobs.length === 0 ? (
                        <View style={styles.emptyTimeline}>
                          <Text style={styles.emptyTimelineText}>
                            No jobs
                          </Text>
                        </View>
                      ) : (
                        schedule.jobs.map((job) => {
                          const blockHeight = Math.max(
                            (job.endTime - job.startTime) * HOUR_HEIGHT,
                            50 // Minimum height for visibility
                          );
                          return (
                            <TouchableOpacity
                              key={job.id}
                              style={[
                                styles.jobBlock,
                                {
                                  top: job.startTime * HOUR_HEIGHT,
                                  height: blockHeight,
                                  backgroundColor: getEmployeeColor(
                                    schedule.employeeId
                                  ),
                                },
                              ]}
                            >
                              <Text
                                style={styles.jobBlockCustomer}
                                numberOfLines={1}
                              >
                                {job.customerName}
                              </Text>
                              <Text style={styles.jobBlockType} numberOfLines={1}>
                                {job.type}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      )}
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
  // View Toggle Styles
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  // Timeline Styles
  timelineContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  employeeHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 12,
  },
  hourLabelPlaceholder: {
    width: 80,
    borderRightWidth: 2,
    borderRightColor: "#e5e5e5",
  },
  employeeNamesRow: {
    flexDirection: "row",
  },
  timelineEmployeeHeader: {
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    paddingHorizontal: 8,
  },
  timelineEmployeeName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
    textAlign: "center",
  },
  timelineJobCount: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  timelineGrid: {
    flex: 1,
    flexDirection: "row",
  },
  hourLabelsColumn: {
    width: 80,
    backgroundColor: "#fafafa",
    borderRightWidth: 2,
    borderRightColor: "#e5e5e5",
  },
  hourLabel: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  hourLabelText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  employeeColumnsContainer: {
    flexDirection: "row",
  },
  employeeColumn: {
    position: "relative",
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
  },
  hourGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#e5e5e5",
  },
  jobBlock: {
    position: "absolute",
    left: 4,
    right: 4,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  jobBlockCustomer: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  jobBlockType: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.9,
  },
  emptyTimeline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyTimelineText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
});
