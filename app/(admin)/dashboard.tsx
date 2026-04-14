import React, { useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/config/firebase";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/auth/AuthContext";
import {
  getServiceRequests,
  getPendingRequestsCount,
  ServiceRequest,
} from "@/src/auth/data/serviceRequests";
import { getEmployeesForList, EmployeeListItem } from "@/src/services/employeeService";

const screenWidth = Dimensions.get("window").width;

type Employee = {
  id: string;
  name: string;
  email: string;
  status: "Clocked In" | "Clocked Out";
  isClockedIn: boolean;
  currentLocation?: {
    address: string;
  };
};

type Job = {
  id: string;
  status: string;
  scheduledDate?: string;
  completedAt?: string;
};

type DashboardStats = {
  totalEmployees: number;
  clockedInEmployees: number;
  totalJobs: number;
  scheduledJobs: number;
  completedJobsToday: number;
  unscheduledJobs: number;
  pendingRequests: number;
};

type WeeklyData = {
  labels: string[];
  completedJobs: number[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const { companyId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    clockedInEmployees: 0,
    totalJobs: 0,
    scheduledJobs: 0,
    completedJobsToday: 0,
    unscheduledJobs: 0,
    pendingRequests: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    completedJobs: [0, 0, 0, 0, 0, 0, 0],
  });

  const loadDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [
        serviceRequestsData,
        pendingCount,
        employeesData,
        jobsData,
        weeklyJobsData,
      ] = await Promise.all([
        getServiceRequests(),
        getPendingRequestsCount(),
        fetchEmployees(),
        fetchJobs(),
        fetchWeeklyJobData(),
      ]);

      // Process service requests
      const pending = serviceRequestsData.filter((r) => r.status === "Pending");
      setPendingRequests(pending);

      // Process employees
      setEmployees(employeesData);
      const clockedIn = employeesData.filter((e) => e.isClockedIn).length;

      // Process jobs
      const today = new Date().toISOString().split("T")[0];
      const scheduled = jobsData.filter((j) => j.status === "scheduled").length;
      const unscheduled = jobsData.filter((j) => j.status === "unscheduled").length;
      const completedToday = jobsData.filter(
        (j) => j.status === "completed" && j.completedAt?.startsWith(today)
      ).length;

      setStats({
        totalEmployees: employeesData.length,
        clockedInEmployees: clockedIn,
        totalJobs: jobsData.length,
        scheduledJobs: scheduled,
        completedJobsToday: completedToday,
        unscheduledJobs: unscheduled,
        pendingRequests: pendingCount,
      });

      setWeeklyData(weeklyJobsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from centralized service (uses users collection with companyId)
  const fetchEmployees = async (): Promise<Employee[]> => {
    if (!companyId) {
      console.log("No companyId, cannot fetch employees");
      return [];
    }

    try {
      const employeesList = await getEmployeesForList(companyId);
      return employeesList.map((emp: EmployeeListItem) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        status: emp.isClockedIn ? "Clocked In" as const : "Clocked Out" as const,
        isClockedIn: emp.isClockedIn,
        currentLocation: emp.currentLocation,
      }));
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  const fetchJobs = async (): Promise<Job[]> => {
    if (!companyId) {
      console.log("No companyId, cannot fetch jobs");
      return [];
    }

    try {
      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("companyId", "==", companyId));
      const jobsSnapshot = await getDocs(q);

      return jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        status: doc.data().status || "unscheduled",
        scheduledDate: doc.data().scheduledDate,
        completedAt: doc.data().completedAt,
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  };

  const fetchWeeklyJobData = async (): Promise<WeeklyData> => {
    if (!companyId) {
      console.log("No companyId, cannot fetch weekly job data");
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        completedJobs: [0, 0, 0, 0, 0, 0, 0],
      };
    }

    try {
      // Get start of week (Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("companyId", "==", companyId),
        where("status", "==", "completed")
      );
      const jobsSnapshot = await getDocs(q);

      // Count completed jobs per day
      const dailyCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

      jobsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.completedAt) {
          const completedDate = new Date(data.completedAt);
          if (completedDate >= startOfWeek) {
            const dayIndex = completedDate.getDay();
            dailyCounts[dayIndex]++;
          }
        }
      });

      // Reorder to Mon-Sun
      const reordered = [
        dailyCounts[1], // Mon
        dailyCounts[2], // Tue
        dailyCounts[3], // Wed
        dailyCounts[4], // Thu
        dailyCounts[5], // Fri
        dailyCounts[6], // Sat
        dailyCounts[0], // Sun
      ];

      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        completedJobs: reordered,
      };
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        completedJobs: [0, 0, 0, 0, 0, 0, 0],
      };
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [companyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={[styles.employeeCard, { backgroundColor: theme.surface }]}>
      <View style={styles.employeeInfo}>
        <View style={styles.employeeAvatar}>
          <Ionicons name="person" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.employeeName, { color: theme.text }]}>{item.name}</Text>
          {item.currentLocation?.address && item.isClockedIn && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={theme.textSecondary} />
              <Text style={[styles.employeeLocation, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.currentLocation.address}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: item.isClockedIn ? "#34C759" : "#8E8E93",
          },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const renderServiceRequest = ({ item }: { item: ServiceRequest }) => {
    const timeSince = () => {
      const now = new Date();
      const submitted = new Date(item.submittedAt);
      const diffMs = now.getTime() - submitted.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      return "Just now";
    };

    return (
      <TouchableOpacity
        style={[styles.requestCard, { backgroundColor: theme.surface }]}
        onPress={() => {
          router.push({
            pathname: "/(admin)/service-requests/[id]",
            params: { id: item.id },
          });
        }}
      >
        <View style={styles.requestHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.requestName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.requestService, { color: theme.textSecondary }]}>
              {item.serviceType}
            </Text>
          </View>
          {item.isEmergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
            </View>
          )}
        </View>
        <Text style={[styles.requestDescription, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.requestFooter}>
          <Text style={[styles.requestTime, { color: theme.textMuted }]}>{timeSince()}</Text>
          <Text style={[styles.requestPhone, { color: theme.primary }]}>{item.phone}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if there's any completed job data this week
  const hasCompletedJobs = weeklyData.completedJobs.some(v => v > 0);
  const chartData = hasCompletedJobs
    ? weeklyData.completedJobs
    : [0, 0, 0, 0, 0, 0, 0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Text style={[styles.header, { color: theme.text }]}>Dashboard</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push("/(admin)/more/manage-team")}
          >
            <View style={[styles.statIcon, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="people" size={24} color="#0EA5E9" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {stats.clockedInEmployees}/{stats.totalEmployees}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Employees Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push("/(admin)/schedule")}
          >
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="calendar" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {stats.scheduledJobs}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Jobs Scheduled
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push("/(admin)/schedule")}
          >
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {stats.completedJobsToday}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Completed Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push("/(admin)/schedule")}
          >
            <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="time" size={24} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>
              {stats.unscheduledJobs}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Unscheduled
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests Alert */}
        {stats.pendingRequests > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push("/(admin)/service-requests")}
          >
            <View style={styles.alertIcon}>
              <Ionicons name="notifications" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {stats.pendingRequests} Pending Service Request{stats.pendingRequests !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.alertSubtitle}>Tap to review and respond</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Jobs Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Jobs Completed This Week
            </Text>
            <TouchableOpacity
              style={styles.showJobsButton}
              onPress={() => router.push("/(admin)/completed-jobs")}
            >
              <Text style={styles.showJobsButtonText}>Show Jobs</Text>
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </TouchableOpacity>
          </View>

          <LineChart
            data={{
              labels: weeklyData.labels,
              datasets: [
                {
                  data: chartData,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  // Invisible dataset to set Y-axis scale when no data
                  data: [hasCompletedJobs ? Math.max(...chartData, 1) : 5],
                  color: () => "transparent",
                  strokeWidth: 0,
                  withDots: false,
                },
              ],
            }}
            width={screenWidth - 72}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: () => theme.textSecondary,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#10B981",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: theme.border,
                strokeWidth: 1,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            bezier
          />
        </View>

        {/* Pending Service Requests */}
        {pendingRequests.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Pending Requests
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(admin)/service-requests")}
              >
                <Text style={[styles.sectionLink, { color: theme.primary }]}>
                  View All ({stats.pendingRequests})
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pendingRequests.slice(0, 3)}
              renderItem={renderServiceRequest}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {/* Team Status */}
        {employees.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Team Status
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(admin)/more/manage-team")}
              >
                <Text style={[styles.sectionLink, { color: theme.primary }]}>
                  Manage Team
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={employees.slice(0, 5)}
              renderItem={renderEmployee}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {/* Empty State */}
        {employees.length === 0 && stats.totalJobs === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="business-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Welcome to Your Dashboard
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Add employees and jobs to see your business stats here
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(admin)/schedule")}
            >
              <Text style={styles.emptyButtonText}>Go to Schedule</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 20,
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    width: (screenWidth - 52) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  alertCard: {
    backgroundColor: "#F59E0B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  alertSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  showJobsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
  },
  showJobsButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  emptyChartContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 12,
  },
  emptyChartSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  employeeCard: {
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
  employeeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  employeeLocation: {
    fontSize: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  requestCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
  },
  requestService: {
    fontSize: 14,
    marginTop: 2,
  },
  emergencyBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emergencyBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  requestDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestTime: {
    fontSize: 12,
  },
  requestPhone: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
