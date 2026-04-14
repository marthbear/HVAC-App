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

export default function MyReportsScreen() {
  const [dateRange, setDateRange] = useState<DateRange>("month");

  // Mock data - in production, this would come from Firebase/API
  const metrics = {
    jobsCompleted: {
      current: 42,
      previous: 38,
      change: 10.5,
    },
    totalHours: {
      current: 168,
      previous: 152,
      change: 10.5,
    },
    earnings: {
      current: 6720,
      previous: 6080,
      change: 10.5,
    },
    customerRating: {
      current: 4.9,
      previous: 4.7,
      change: 4.3,
    },
  };

  const performanceData = [
    { label: "Mon", value: 8 },
    { label: "Tue", value: 6 },
    { label: "Wed", value: 7 },
    { label: "Thu", value: 5 },
    { label: "Fri", value: 9 },
    { label: "Sat", value: 4 },
    { label: "Sun", value: 3 },
  ];

  const serviceTypes = [
    { name: "AC Maintenance", count: 15, percentage: 36, color: "#007AFF" },
    { name: "Furnace Repair", count: 12, percentage: 29, color: "#FF9500" },
    { name: "New Installation", count: 9, percentage: 21, color: "#34C759" },
    { name: "Emergency Service", count: 6, percentage: 14, color: "#FF3B30" },
  ];

  const recentJobs = [
    {
      id: "1",
      date: "2024-12-26",
      customer: "Johnson Residence",
      service: "AC Maintenance",
      duration: "2h",
      rating: 5,
    },
    {
      id: "2",
      date: "2024-12-25",
      customer: "Smith Commercial",
      service: "Heating Repair",
      duration: "3h",
      rating: 5,
    },
    {
      id: "3",
      date: "2024-12-24",
      customer: "Davis Family",
      service: "System Installation",
      duration: "4h",
      rating: 4,
    },
    {
      id: "4",
      date: "2024-12-23",
      customer: "Williams Apartment",
      service: "AC Repair",
      duration: "2.5h",
      rating: 5,
    },
  ];

  const maxPerformance = Math.max(...performanceData.map((d) => d.value));

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Date Range Filter */}
        <View style={styles.headerSection}>
          <Text style={styles.header}>My Performance</Text>
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
              <Ionicons name="time-outline" size={24} color="#FF9500" />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.totalHours.change) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getChangeIcon(metrics.totalHours.change) as any}
                  size={12}
                  color={getChangeColor(metrics.totalHours.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(metrics.totalHours.change) },
                  ]}
                >
                  {metrics.totalHours.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{metrics.totalHours.current}h</Text>
            <Text style={styles.metricLabel}>Total Hours</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash-outline" size={24} color="#34C759" />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.earnings.change) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getChangeIcon(metrics.earnings.change) as any}
                  size={12}
                  color={getChangeColor(metrics.earnings.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(metrics.earnings.change) },
                  ]}
                >
                  {metrics.earnings.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(metrics.earnings.current)}
            </Text>
            <Text style={styles.metricLabel}>Total Earnings</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="star-outline" size={24} color="#FFD700" />
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      getChangeColor(metrics.customerRating.change) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getChangeIcon(metrics.customerRating.change) as any}
                  size={12}
                  color={getChangeColor(metrics.customerRating.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(metrics.customerRating.change) },
                  ]}
                >
                  {metrics.customerRating.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {metrics.customerRating.current}
            </Text>
            <Text style={styles.metricLabel}>Customer Rating</Text>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Jobs Completed</Text>
            <TouchableOpacity>
              <Ionicons name="download-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.chart}>
            {performanceData.map((item, index) => {
              const barHeight = (item.value / maxPerformance) * 140;
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
                  <Text style={styles.barValue}>{item.value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Service Types Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Breakdown</Text>
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

        {/* Recent Jobs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Jobs</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentJobs.map((job) => (
            <View key={job.id} style={styles.jobRow}>
              <View style={styles.jobInfo}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobDate}>{formatDate(job.date)}</Text>
                  <View style={styles.jobRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{job.rating}</Text>
                  </View>
                </View>
                <Text style={styles.jobCustomer}>{job.customer}</Text>
                <View style={styles.jobDetails}>
                  <View style={styles.jobDetail}>
                    <Ionicons name="construct-outline" size={14} color="#666" />
                    <Text style={styles.jobDetailText}>{job.service}</Text>
                  </View>
                  <View style={styles.jobDetail}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.jobDetailText}>{job.duration}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Export Options */}
        <View style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export My Reports</Text>
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
    height: 180,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barContainer: {
    width: "80%",
    height: 140,
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
    fontSize: 11,
    color: "#000",
    marginTop: 2,
    fontWeight: "700",
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
  jobRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  jobInfo: {
    flex: 1,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  jobDate: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  jobRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  jobCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  jobDetails: {
    flexDirection: "row",
    gap: 16,
  },
  jobDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobDetailText: {
    fontSize: 13,
    color: "#666",
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
