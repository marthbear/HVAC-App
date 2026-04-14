import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/src/config/firebase";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/auth/AuthContext";

type CompletedJob = {
  id: string;
  customerName: string;
  address: string;
  jobType: string;
  completedAt: string;
  assignedEmployeeId?: string;
  estimatedDuration?: number;
  description?: string;
};

export default function CompletedJobsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { companyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(new Date());

  // Calculate start of week (Sunday)
  const getStartOfWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const fetchCompletedJobs = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      const startOfWeek = getStartOfWeek();
      setWeekStart(startOfWeek);

      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("companyId", "==", companyId),
        where("status", "==", "completed")
      );
      const snapshot = await getDocs(q);

      const completedJobs: CompletedJob[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.completedAt) {
          const completedDate = new Date(data.completedAt);
          if (completedDate >= startOfWeek) {
            completedJobs.push({
              id: doc.id,
              customerName: data.customerName || "Unknown Customer",
              address: data.address || "",
              jobType: data.jobType || "Service",
              completedAt: data.completedAt,
              assignedEmployeeId: data.assignedEmployeeId,
              estimatedDuration: data.estimatedDuration,
              description: data.description,
            });
          }
        }
      });

      // Sort by completion date (most recent first)
      completedJobs.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      setJobs(completedJobs);
    } catch (error) {
      console.error("Error fetching completed jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, [companyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompletedJobs();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Group jobs by day
  const groupedJobs = jobs.reduce((groups, job) => {
    const day = getDayName(job.completedAt);
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(job);
    return groups;
  }, {} as Record<string, CompletedJob[]>);

  const sections = Object.entries(groupedJobs).map(([day, dayJobs]) => ({
    day,
    jobs: dayJobs,
  }));

  const renderJob = ({ item }: { item: CompletedJob }) => (
    <View style={[styles.jobCard, { backgroundColor: theme.surface }]}>
      <View style={styles.jobHeader}>
        <View style={[styles.jobTypeIcon, { backgroundColor: "#D1FAE5" }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        </View>
        <View style={styles.jobHeaderText}>
          <Text style={[styles.jobCustomer, { color: theme.text }]}>
            {item.customerName}
          </Text>
          <Text style={[styles.jobType, { color: theme.textSecondary }]}>
            {item.jobType}
          </Text>
        </View>
        <View style={styles.completedTime}>
          <Text style={[styles.completedTimeText, { color: theme.textMuted }]}>
            {formatTime(item.completedAt)}
          </Text>
        </View>
      </View>

      {item.address && (
        <View style={styles.jobDetail}>
          <Ionicons name="location-outline" size={14} color={theme.textMuted} />
          <Text
            style={[styles.jobDetailText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.address}
          </Text>
        </View>
      )}

      {item.description && (
        <View style={styles.jobDetail}>
          <Ionicons name="document-text-outline" size={14} color={theme.textMuted} />
          <Text
            style={[styles.jobDetailText, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
      )}

      {item.estimatedDuration && (
        <View style={styles.jobDetail}>
          <Ionicons name="time-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
            Duration: {item.estimatedDuration}h
          </Text>
        </View>
      )}
    </View>
  );

  const renderSection = ({ item }: { item: { day: string; jobs: CompletedJob[] } }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{item.day}</Text>
        <View style={[styles.countBadge, { backgroundColor: "#10B981" }]}>
          <Text style={styles.countText}>{item.jobs.length}</Text>
        </View>
      </View>
      {item.jobs.map((job) => (
        <View key={job.id}>{renderJob({ item: job })}</View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Completed Jobs
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading completed jobs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Completed Jobs
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Week Info */}
      <View style={[styles.weekInfo, { backgroundColor: theme.surface }]}>
        <Ionicons name="calendar-outline" size={20} color={theme.primary} />
        <Text style={[styles.weekInfoText, { color: theme.text }]}>
          Week of {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </Text>
        <View style={[styles.totalBadge, { backgroundColor: "#10B981" }]}>
          <Text style={styles.totalBadgeText}>{jobs.length} total</Text>
        </View>
      </View>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-done-outline" size={48} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Completed Jobs
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Jobs completed this week will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(item) => item.day}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  weekInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  weekInfoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  totalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  jobCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  jobTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  jobHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  jobCustomer: {
    fontSize: 16,
    fontWeight: "600",
  },
  jobType: {
    fontSize: 13,
    marginTop: 2,
  },
  completedTime: {
    alignItems: "flex-end",
  },
  completedTimeText: {
    fontSize: 12,
  },
  jobDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  jobDetailText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
