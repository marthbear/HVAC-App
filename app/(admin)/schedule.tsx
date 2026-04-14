import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Job } from "@/src/auth/data/jobs";
import {
  generateAISchedule,
  applySchedule,
  ScheduleAssignment,
  AIScheduleResponse,
  getUnscheduledJobs,
  getScheduledJobs,
  getAllJobs,
  getAvailableEmployees,
  addSampleJobs,
  addSampleEmployees,
  clearTestData,
  SchedulableJob,
  SchedulableEmployee,
} from "@/src/auth/data/scheduling";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/auth/AuthContext";

type EmployeeSchedule = {
  employeeId: string;
  employeeName: string;
  jobs: Job[];
};

type ViewMode = "list" | "timeline";

export default function AdminScheduleScreen() {
  const { theme } = useTheme();
  const { companyId } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const headerScrollRef = useRef<ScrollView>(null);

  // AI Scheduling state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiScheduleResult, setAiScheduleResult] = useState<AIScheduleResponse | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [unscheduledCount, setUnscheduledCount] = useState(0);
  const [isAddingSampleData, setIsAddingSampleData] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [firestoreJobs, setFirestoreJobs] = useState<SchedulableJob[]>([]);
  const [firestoreEmployees, setFirestoreEmployees] = useState<SchedulableEmployee[]>([]);

  // Fetch all data from Firestore
  const fetchAllData = async () => {
    const [unscheduledJobs, allJobs, employees] = await Promise.all([
      getUnscheduledJobs(companyId),
      getAllJobs(companyId),
      getAvailableEmployees(companyId),
    ]);
    setUnscheduledCount(unscheduledJobs.length);
    setEmployeeCount(employees.length);
    setFirestoreJobs(allJobs);
    setFirestoreEmployees(employees);
  };

  useEffect(() => {
    fetchAllData();
  }, [aiScheduleResult, isAddingSampleData, companyId]);

  // Add sample data for testing
  const handleAddSampleData = async () => {
    console.log("Add sample data button pressed");
    setIsAddingSampleData(true);

    try {
      console.log("Adding sample jobs...");
      await addSampleJobs(companyId);
      console.log("Sample jobs added!");

      console.log("Adding sample employees...");
      await addSampleEmployees();
      console.log("Sample employees added!");

      // Refresh all data
      await fetchAllData();

      Alert.alert("Success", `Added sample jobs and employees!`);
    } catch (error: any) {
      console.error("Error adding sample data:", error);
      Alert.alert(
        "Error",
        `Failed to add sample data: ${error?.message || "Unknown error"}`
      );
    } finally {
      setIsAddingSampleData(false);
    }
  };

  // Perform the actual clear operation
  const performClear = async () => {
    setIsClearingData(true);
    try {
      console.log("Starting data clear...");
      const { jobsDeleted, employeesDeleted } = await clearTestData(companyId);
      console.log(`Cleared: ${jobsDeleted} jobs, ${employeesDeleted} employees`);

      // Clear local state immediately
      setUnscheduledCount(0);
      setEmployeeCount(0);
      setFirestoreJobs([]);
      setFirestoreEmployees([]);

      // Verify the clear worked by re-fetching
      console.log("Verifying clear...");
      const [remainingJobs, remainingEmployees] = await Promise.all([
        getAllJobs(),
        getAvailableEmployees(companyId),
      ]);

      console.log(`Remaining: ${remainingJobs.length} jobs, ${remainingEmployees.length} employees`);

      if (remainingJobs.length > 0 || remainingEmployees.length > 0) {
        Alert.alert(
          "Partial Clear",
          `Deleted ${jobsDeleted} jobs and ${employeesDeleted} employees, but ${remainingJobs.length} jobs and ${remainingEmployees.length} employees remain. Try clearing again.`
        );
      } else {
        Alert.alert("Success", `Deleted ${jobsDeleted} jobs and ${employeesDeleted} employees.`);
      }
    } catch (error: any) {
      console.error("Error clearing test data:", error);
      Alert.alert("Error", `Failed to clear data: ${error?.message || "Unknown error"}`);
    } finally {
      setIsClearingData(false);
    }
  };

  // Clear test data - directly clears without confirmation for now
  const handleClearTestData = () => {
    console.log("Clear button pressed - clearing data directly");
    performClear();
  };

  // Generate AI Schedule
  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setShowAIModal(true);
    setAiScheduleResult(null);

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const result = await generateAISchedule(dateStr);
      setAiScheduleResult(result);
    } catch (error) {
      console.error("Error generating schedule:", error);
      setAiScheduleResult({
        success: false,
        schedule: [],
        summary: {
          totalJobs: 0,
          totalEmployees: 0,
          totalDriveTime: 0,
          averageJobsPerEmployee: 0,
        },
        error: error instanceof Error ? error.message : "Failed to generate schedule",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply AI Schedule
  const handleApplySchedule = async () => {
    if (!aiScheduleResult?.schedule.length) return;

    Alert.alert(
      "Apply Schedule",
      `This will schedule ${aiScheduleResult.schedule.length} jobs. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: async () => {
            setIsApplying(true);
            try {
              const success = await applySchedule(aiScheduleResult.schedule);
              if (success) {
                // Refresh all data to show newly scheduled jobs
                await fetchAllData();
                Alert.alert("Success", "Schedule applied successfully!");
                setShowAIModal(false);
                setAiScheduleResult(null);
              } else {
                Alert.alert("Error", "Failed to apply schedule");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to apply schedule");
            } finally {
              setIsApplying(false);
            }
          },
        },
      ]
    );
  };

  // Group AI schedule by employee
  const groupedAISchedule = aiScheduleResult?.schedule.reduce((acc, assignment) => {
    if (!acc[assignment.employeeId]) {
      acc[assignment.employeeId] = {
        employeeName: assignment.employeeName,
        assignments: [],
      };
    }
    acc[assignment.employeeId].assignments.push(assignment);
    return acc;
  }, {} as Record<string, { employeeName: string; assignments: ScheduleAssignment[] }>) || {};

  // Convert Firestore jobs to display format and filter by selected date
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const filteredJobs: Job[] = firestoreJobs
    .filter((job) => {
      // Filter scheduled jobs for the selected date
      if (job.status !== "scheduled") return false;
      return job.scheduledDate === selectedDateStr;
    })
    .map((job) => ({
      id: job.id,
      employeeId: job.assignedEmployeeId || "",
      customerName: job.customerName,
      startTime: job.scheduledStartTime || 9,
      endTime: job.scheduledEndTime || 10,
      type: job.jobType,
      status: "Scheduled" as const,
      date: job.scheduledDate || "",
    }));

  // Group jobs by employee from Firestore employees
  const employeeSchedules: EmployeeSchedule[] = firestoreEmployees.map((employee) => ({
    employeeId: employee.id,
    employeeName: employee.name,
    jobs: filteredJobs.filter((job) => job.employeeId === employee.id),
  }));

  // Timeline constants
  const HOUR_HEIGHT = 60; // pixels per hour
  const TIMELINE_HEIGHT = HOUR_HEIGHT * 24; // 1440px total
  const HOUR_LABEL_WIDTH = 80; // Width for hour labels column

  // Calculate employee column width to fill screen
  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - HOUR_LABEL_WIDTH - 40; // Subtract hour labels and padding
  const EMPLOYEE_COLUMN_WIDTH = Math.max(
    employeeSchedules.length > 0 ? availableWidth / employeeSchedules.length : 150,
    150 // Minimum width per column
  );

  // Dynamic employee color palette
  const EMPLOYEE_COLOR_PALETTE = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#95E1D3", // Mint
    "#FFB347", // Orange
    "#87CEEB", // Sky Blue
    "#DDA0DD", // Plum
    "#98D8C8", // Seafoam
    "#F7DC6F", // Yellow
  ];

  const getEmployeeColor = (employeeId: string): string => {
    const index = firestoreEmployees.findIndex((e) => e.id === employeeId);
    if (index === -1) return "#999";
    return EMPLOYEE_COLOR_PALETTE[index % EMPLOYEE_COLOR_PALETTE.length];
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display} ${period}`;
  };

  const syncFromColumns = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    headerScrollRef.current?.scrollTo({ x: offsetX, animated: false });
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Team Schedule</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.sampleDataButton, isAddingSampleData && { opacity: 0.6 }]}
            onPress={handleAddSampleData}
            disabled={isAddingSampleData}
          >
            {isAddingSampleData ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={16} color="#fff" />
                <Text style={styles.sampleDataButtonText}>Add Test Data</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearDataButton, isClearingData && { opacity: 0.6 }]}
            onPress={handleClearTestData}
            disabled={isClearingData}
          >
            {isClearingData ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={styles.sampleDataButtonText}>Clear</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aiButton, { backgroundColor: "#8B5CF6" }]}
            onPress={handleGenerateSchedule}
            disabled={isGenerating || (unscheduledCount === 0)}
          >
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.aiButtonText}>AI Schedule</Text>
            {unscheduledCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unscheduledCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
        </View>
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
        {filteredJobs.length === 0 ? (
          <View style={[styles.emptyScheduleContainer, { backgroundColor: theme.surface }]}>
            <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyScheduleTitle, { color: theme.text }]}>
              Nothing Scheduled
            </Text>
            <Text style={[styles.emptyScheduleSubtitle, { color: theme.textSecondary }]}>
              No jobs are scheduled for this day
            </Text>
            {unscheduledCount > 0 && (
              <TouchableOpacity
                style={styles.scheduleNowButton}
                onPress={handleGenerateSchedule}
              >
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.scheduleNowButtonText}>
                  Schedule {unscheduledCount} Job{unscheduledCount !== 1 ? "s" : ""} with AI
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          employeeSchedules.map((schedule) => (
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
          ))
        )}
      </ScrollView>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <View style={styles.timelineContainer}>
          {/* Header Row - Employee Boxes */}
          <View style={styles.timelineHeaderRow}>
            <View style={styles.headerSpacer} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              ref={headerScrollRef}
              contentContainerStyle={employeeSchedules.length === 0 ? { flex: 1 } : undefined}
            >
              <View style={[styles.employeeNamesRow, employeeSchedules.length === 0 && { flex: 1 }]}>
                {employeeSchedules.length === 0 ? (
                  <View style={styles.noEmployeesHeader}>
                    <Text style={[styles.noEmployeesText, { color: theme.textMuted }]}>
                      No employees added yet
                    </Text>
                  </View>
                ) : (
                  employeeSchedules.map((schedule) => (
                    <View
                      key={schedule.employeeId}
                      style={[
                        styles.timelineEmployeeHeader,
                        { width: EMPLOYEE_COLUMN_WIDTH, backgroundColor: theme.surface },
                      ]}
                    >
                      <Text style={[styles.timelineEmployeeName, { color: theme.text }]} numberOfLines={1}>
                        {schedule.employeeName}
                      </Text>
                      <Text style={[styles.timelineJobCount, { color: theme.textSecondary }]}>
                        {schedule.jobs.length}{" "}
                        {schedule.jobs.length === 1 ? "job" : "jobs"}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>

          {/* Unified Scrollable Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={styles.timelineGrid}>
              {/* Hour Labels Column */}
              <View style={[styles.hourLabelsColumn, { backgroundColor: theme.surface }]}>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <View
                    key={hour}
                    style={[styles.hourLabel, { height: HOUR_HEIGHT, borderBottomColor: theme.border }]}
                  >
                    <Text style={[styles.hourLabelText, { color: theme.textSecondary }]}>
                      {formatHour(hour)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Grid Area */}
              <View style={styles.gridArea}>
                {/* Background Grid Lines */}
                {Array.from({ length: 24 }, (_, i) => i).map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.gridLine,
                      { top: i * HOUR_HEIGHT, borderBottomColor: theme.border },
                    ]}
                  />
                ))}

                {/* Employee Columns - Horizontally Scrollable */}
                {employeeSchedules.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={syncFromColumns}
                    style={styles.employeeColumnsScroll}
                  >
                    <View style={styles.employeeColumnsContainer}>
                      {employeeSchedules.map((schedule) => (
                        <View
                          key={schedule.employeeId}
                          style={[
                            styles.employeeColumn,
                            {
                              width: EMPLOYEE_COLUMN_WIDTH,
                              height: TIMELINE_HEIGHT,
                              borderRightColor: theme.border,
                            },
                          ]}
                        >
                          {/* Job Blocks */}
                          {schedule.jobs.map((job) => {
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
                          })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* AI Schedule Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !isGenerating && setShowAIModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              onPress={() => !isGenerating && !isApplying && setShowAIModal(false)}
              disabled={isGenerating || isApplying}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>AI Schedule</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Loading State */}
          {isGenerating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Generating optimized schedule...
              </Text>
              <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
                Analyzing jobs, skills, and locations
              </Text>
            </View>
          )}

          {/* Error State */}
          {!isGenerating && aiScheduleResult && !aiScheduleResult.success && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={[styles.errorText, { color: theme.text }]}>
                Failed to generate schedule
              </Text>
              <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
                {aiScheduleResult.error}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleGenerateSchedule}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Success State */}
          {!isGenerating && aiScheduleResult?.success && (
            <>
              {/* Summary */}
              <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>
                      {aiScheduleResult.summary.totalJobs}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      Jobs
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                      {aiScheduleResult.summary.totalEmployees}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      Technicians
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
                      {aiScheduleResult.summary.totalDriveTime}m
                    </Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      Drive Time
                    </Text>
                  </View>
                </View>
              </View>

              {/* Schedule by Employee */}
              <ScrollView style={styles.scheduleList}>
                {Object.entries(groupedAISchedule).map(([employeeId, data]) => (
                  <View key={employeeId} style={[styles.employeeScheduleCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.employeeScheduleHeader}>
                      <Ionicons name="person-circle" size={24} color="#8B5CF6" />
                      <Text style={[styles.employeeScheduleName, { color: theme.text }]}>
                        {data.employeeName}
                      </Text>
                      <Text style={[styles.employeeJobCount, { color: theme.textSecondary }]}>
                        {data.assignments.length} jobs
                      </Text>
                    </View>

                    {data.assignments.map((assignment, index) => (
                      <View key={index} style={[styles.assignmentCard, { borderColor: theme.border }]}>
                        <View style={styles.assignmentTime}>
                          <Text style={[styles.assignmentTimeText, { color: "#8B5CF6" }]}>
                            {new Date(assignment.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                          <Text style={[styles.assignmentDuration, { color: theme.textSecondary }]}>
                            {assignment.estimatedDriveTime}m drive
                          </Text>
                        </View>
                        <View style={styles.assignmentDetails}>
                          <Text style={[styles.assignmentCustomer, { color: theme.text }]}>
                            {assignment.customerName}
                          </Text>
                          <Text style={[styles.assignmentType, { color: theme.textSecondary }]}>
                            {assignment.jobType}
                          </Text>
                          <Text style={[styles.assignmentAddress, { color: theme.textMuted }]} numberOfLines={1}>
                            {assignment.address}
                          </Text>
                          <Text style={[styles.assignmentReasoning, { color: theme.textSecondary }]} numberOfLines={2}>
                            {assignment.reasoning}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

              {/* Apply Button */}
              <View style={[styles.applyContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity
                  style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
                  onPress={handleApplySchedule}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.applyButtonText}>Apply Schedule</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Empty State */}
          {!isGenerating && aiScheduleResult?.success && aiScheduleResult.schedule.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No jobs to schedule
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Add unscheduled jobs to use AI scheduling
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sampleDataButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#10B981",
    gap: 4,
  },
  sampleDataButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  clearDataButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    gap: 4,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  aiButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
  emptyScheduleContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyScheduleTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyScheduleSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  scheduleNowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    gap: 6,
  },
  scheduleNowButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyTimelineContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  timelineHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e5e5",
  },
  headerSpacer: {
    width: 80,
    height: 60,
    backgroundColor: "#fff",
    borderRightWidth: 2,
    borderRightColor: "#e5e5e5",
  },
  employeeNamesRow: {
    flexDirection: "row",
    height: 60,
  },
  noEmployeesHeader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  noEmployeesText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  timelineEmployeeHeader: {
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    paddingHorizontal: 8,
    height: 60,
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
  gridArea: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
    height: 24 * 60, // TIMELINE_HEIGHT = HOUR_HEIGHT * 24
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0,
    borderBottomWidth: 1,
  },
  employeeColumnsScroll: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emptyTimelineText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  // AI Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  scheduleList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  employeeScheduleCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  employeeScheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  employeeScheduleName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  employeeJobCount: {
    fontSize: 13,
  },
  assignmentCard: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  assignmentTime: {
    width: 70,
    alignItems: "center",
  },
  assignmentTimeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  assignmentDuration: {
    fontSize: 11,
    marginTop: 2,
  },
  assignmentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  assignmentCustomer: {
    fontSize: 15,
    fontWeight: "600",
  },
  assignmentType: {
    fontSize: 13,
    marginTop: 2,
  },
  assignmentAddress: {
    fontSize: 12,
    marginTop: 4,
  },
  assignmentReasoning: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 6,
  },
  applyContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  applyButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
