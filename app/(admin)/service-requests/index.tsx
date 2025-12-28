import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getServiceRequests,
  ServiceRequest,
} from "@/src/auth/data/serviceRequests";

export default function ServiceRequestsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const loadRequests = async () => {
    const allRequests = await getServiceRequests();
    setRequests(allRequests);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const timeSince = (submittedAt: string) => {
    const now = new Date();
    const submitted = new Date(submittedAt);
    const diffMs = now.getTime() - submitted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  const getStatusColor = (status: ServiceRequest["status"]) => {
    switch (status) {
      case "Pending":
        return "#FF9500";
      case "Approved":
        return "#34C759";
      case "Rejected":
        return "#FF3B30";
      case "Converted":
        return "#007AFF";
      default:
        return "#8E8E93";
    }
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
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
        <View style={styles.badges}>
          {item.isEmergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {item.address && (
        <Text style={styles.requestAddress} numberOfLines={1}>
          📍 {item.address}
        </Text>
      )}

      {item.preferredDate && (
        <Text style={styles.requestDate}>
          Preferred: {item.preferredDate}
        </Text>
      )}

      <View style={styles.requestFooter}>
        <Text style={styles.requestTime}>{timeSince(item.submittedAt)}</Text>
        <View style={styles.contactInfo}>
          {item.email && (
            <Text style={styles.requestEmail}>{item.email}</Text>
          )}
          <Text style={styles.requestPhone}>{item.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const otherRequests = requests.filter((r) => r.status !== "Pending");

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Service Requests</Text>
            <Text style={styles.subtitle}>
              {pendingRequests.length} pending, {otherRequests.length} other
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No service requests yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
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
    alignItems: "flex-start",
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
  badges: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  requestDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
    lineHeight: 20,
  },
  requestAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
    marginTop: 4,
  },
  requestTime: {
    fontSize: 12,
    color: "#999",
  },
  contactInfo: {
    alignItems: "flex-end",
  },
  requestEmail: {
    fontSize: 12,
    color: "#007AFF",
    marginBottom: 2,
  },
  requestPhone: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
