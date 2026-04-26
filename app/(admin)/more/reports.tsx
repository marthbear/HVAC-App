import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DateRange = "week" | "month" | "quarter" | "year";

export default function ReportsScreen() {
  const [dateRange, setDateRange] = useState<DateRange>("month");

  // Mock data - in production, this would come from Firebase/API
  const metrics = {
    revenue: {
      current: 45280,
      previous: 38950,
      change: 16.3,
    },
    jobsCompleted: {
      current: 127,
      previous: 119,
      change: 6.7,
    },
    avgJobValue: {
      current: 356,
      previous: 327,
      change: 8.9,
    },
    customerSatisfaction: {
      current: 4.8,
      previous: 4.6,
      change: 4.3,
    },
  };

  const revenueData = [
    { label: "Mon", value: 5200 },
    { label: "Tue", value: 6800 },
    { label: "Wed", value: 7100 },
    { label: "Thu", value: 6300 },
    { label: "Fri", value: 8900 },
    { label: "Sat", value: 5400 },
    { label: "Sun", value: 5580 },
  ];

  const serviceTypes = [
    { name: "AC Maintenance", count: 45, percentage: 35, color: "#007AFF" },
    { name: "Furnace Repair", count: 32, percentage: 25, color: "#FF9500" },
    { name: "New Installation", count: 28, percentage: 22, color: "#34C759" },
    { name: "Emergency Service", count: 22, percentage: 18, color: "#FF3B30" },
  ];

  const topEmployees = [
    { name: "John Smith", jobs: 42, revenue: 14960, rating: 4.9 },
    { name: "Sarah Johnson", jobs: 38, revenue: 13340, rating: 4.8 },
    { name: "Mike Williams", jobs: 35, revenue: 12180, rating: 4.7 },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.value));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "#34C759" : "#FF3B30";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? "trending-up" : "trending-down";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Range Filter */}
        <View style={styles.headerSection}>
          <View style={styles.dateRangeContainer}>
            {(["week", "month", "quarter", "year"] as DateRange[]).map(
              (range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.dateRangeButton,
                    dateRange === range && styles.dateRangeButtonActive,
                  ]}
                  onPress={() => setDateRange(range)}
                >
                  <Text
                    style={[
                      styles.dateRangeText,
                      dateRange === range && styles.dateRangeTextActive,
                    ]}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Key Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash-outline" size={24} color="#34C759" />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.revenue.change) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getChangeIcon(metrics.revenue.change) as any}
                  size={12}
                  color={getChangeColor(metrics.revenue.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(metrics.revenue.change) },
                  ]}
                >
                  {metrics.revenue.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(metrics.revenue.current)}
            </Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#007AFF"
              />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.jobsCompleted.change) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getChangeIcon(metrics.jobsCompleted.change) as any}
                  size={12}
                  color={getChangeColor(metrics.jobsCompleted.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(metrics.jobsCompleted.change) },
                  ]}
                >
                  {metrics.jobsCompleted.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {metrics.jobsCompleted.current}
            </Text>
            <Text style={styles.metricLabel}>Jobs Completed</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="pricetag-outline" size={24} color="#FF9500" />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.avgJobValue.change) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getChangeIcon(metrics.avgJobValue.change) as any}
                  size={12}
                  color={getChangeColor(metrics.avgJobValue.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(metrics.avgJobValue.change) },
                  ]}
                >
                  {metrics.avgJobValue.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(metrics.avgJobValue.current)}
            </Text>
            <Text style={styles.metricLabel}>Avg Job Value</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="star-outline" size={24} color="#FFD700" />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.customerSatisfaction.change) +
                      "20",
                  },
                ]}
              >
                <Ionicons
                  name={
                    getChangeIcon(metrics.customerSatisfaction.change) as any
                  }
                  size={12}
                  color={getChangeColor(metrics.customerSatisfaction.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    {
                      color: getChangeColor(
                        metrics.customerSatisfaction.change
                      ),
                    },
                  ]}
                >
                  {metrics.customerSatisfaction.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {metrics.customerSatisfaction.current}
            </Text>
            <Text style={styles.metricLabel}>Customer Rating</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Revenue</Text>
            <TouchableOpacity>
              <Ionicons name="download-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.chart}>
            {revenueData.map((item, index) => {
              const barHeight = (item.value / maxRevenue) * 180;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: "#007AFF",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <Text style={styles.barValue}>
                    {formatCurrency(item.value).replace("$", "$").slice(0, -3)}k
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Service Types Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Types</Text>
          {serviceTypes.map((service, index) => (
            <View key={index} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <View
                  style={[
                    styles.serviceColorDot,
                    { backgroundColor: service.color },
                  ]}
                />
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
              <View style={styles.serviceStats}>
                <Text style={styles.serviceCount}>{service.count}</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${service.percentage}%`,
                        backgroundColor: service.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.servicePercentage}>
                  {service.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Performing Employees */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top Performers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {topEmployees.map((employee, index) => (
            <View key={index} style={styles.employeeRow}>
              <View style={styles.employeeRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <View style={styles.employeeStats}>
                  <View style={styles.employeeStat}>
                    <Ionicons name="briefcase-outline" size={14} color="#666" />
                    <Text style={styles.employeeStatText}>
                      {employee.jobs} jobs
                    </Text>
                  </View>
                  <View style={styles.employeeStat}>
                    <Ionicons name="cash-outline" size={14} color="#666" />
                    <Text style={styles.employeeStatText}>
                      {formatCurrency(employee.revenue)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.employeeRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{employee.rating}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Export Options */}
        <View style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export Reports</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#007AFF"
              />
              <Text style={styles.exportButtonText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Ionicons name="grid-outline" size={20} color="#007AFF" />
              <Text style={styles.exportButtonText}>Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Ionicons name="mail-outline" size={20} color="#007AFF" />
              <Text style={styles.exportButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  dateRangeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  dateRangeButtonActive: {
    backgroundColor: "#007AFF",
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  dateRangeTextActive: {
    color: "#fff",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: "#666",
  },
  chartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 220,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barContainer: {
    width: "80%",
    height: 180,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
    fontWeight: "600",
  },
  barValue: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  serviceStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceCount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    width: 30,
    textAlign: "right",
  },
  progressBarContainer: {
    width: 80,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  servicePercentage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    width: 35,
    textAlign: "right",
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  employeeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#007AFF",
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  employeeStats: {
    flexDirection: "row",
    gap: 16,
  },
  employeeStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  employeeStatText: {
    fontSize: 13,
    color: "#666",
  },
  employeeRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  exportCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
});
