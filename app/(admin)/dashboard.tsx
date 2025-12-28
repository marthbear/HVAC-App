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
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getServiceRequests,
  getPendingRequestsCount,
  ServiceRequest,
} from "@/src/auth/data/serviceRequests";

const screenWidth = Dimensions.get("window").width;

type Employee = {
  id: string;
  name: string;
  status: "Active" | "Idle" | "Off Duty";
  jobsToday: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const loadServiceRequests = async () => {
    const requests = await getServiceRequests();
    const pending = requests.filter((r) => r.status === "Pending");
    setPendingRequests(pending);
    const count = await getPendingRequestsCount();
    setPendingCount(count);
  };

  useEffect(() => {
    loadServiceRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServiceRequests();
    setRefreshing(false);
  };

  // Mock company stats
  const companyStats = {
    totalEmployees: 12,
    activeEmployees: 8,
    jobsScheduled: 24,
    jobsCompleted: 15,
    revenue: 12450,
    pendingRequests: pendingCount,
  };

  // Mock employee data
  const employees: Employee[] = [
    {
      id: "1",
      name: "John Smith",
      status: "Active",
      jobsToday: 3,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      status: "Active",
      jobsToday: 2,
    },
    {
      id: "3",
      name: "Mike Williams",
      status: "Idle",
      jobsToday: 1,
    },
    {
      id: "4",
      name: "Emily Davis",
      status: "Active",
      jobsToday: 4,
    },
  ];

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeJobs}>{item.jobsToday} jobs today</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              item.status === "Active"
                ? "#34C759"
                : item.status === "Idle"
                ? "#FF9500"
                : "#8E8E93",
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
        style={styles.requestCard}
        onPress={() => {
          router.push({
            pathname: "/(admin)/service-requests/[id]",
            params: { id: item.id },
          });
        }}
      >
        <View style={styles.requestHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.requestName}>{item.name}</Text>
            <Text style={styles.requestService}>{item.serviceType}</Text>
          </View>
          {item.isEmergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
            </View>
          )}
        </View>
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.requestFooter}>
          <Text style={styles.requestTime}>{timeSince()}</Text>
          <Text style={styles.requestPhone}>{item.phone}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Text style={styles.header}>Admin Dashboard</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{companyStats.activeEmployees}</Text>
            <Text style={styles.statLabel}>Active Employees</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{companyStats.jobsScheduled}</Text>
            <Text style={styles.statLabel}>Jobs Scheduled</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#34C759" }]}>
              {companyStats.jobsCompleted}
            </Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#007AFF" }]}>
              ${companyStats.revenue.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Revenue Today</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#FF9500" }]}>
              {companyStats.pendingRequests}
            </Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Revenue</Text>

          <LineChart
            data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [
                {
                  data: [8500, 9200, 10100, 8900, 12450, 11200, 9800],
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                },
              ],
            }}
            width={screenWidth - 72}
            height={220}
            yAxisLabel="$"
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
            }}
          />
        </View>

        {/* Pending Service Requests */}
        {pendingCount > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Service Requests</Text>
              <TouchableOpacity
                onPress={() => router.push("/(admin)/service-requests")}
              >
                <Text style={styles.sectionLink}>View All ({pendingCount})</Text>
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

        {/* Employee Status */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Status</Text>
          <Text style={styles.sectionLink}>View All</Text>
        </View>

        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
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
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: (screenWidth - 52) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  employeeCard: {
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
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  employeeJobs: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
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
    backgroundColor: "#fff",
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
    color: "#222",
  },
  requestService: {
    fontSize: 14,
    color: "#666",
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
    color: "#444",
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
    color: "#999",
  },
  requestPhone: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
});
