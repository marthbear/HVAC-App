import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type AdminMessage = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  type: "employee" | "customer" | "system";
};

export default function AdminInboxScreen() {
  const router = useRouter();

  // Mock admin messages
  const messages: AdminMessage[] = [
    {
      id: "1",
      from: "John Smith",
      subject: "Request for Time Off",
      preview: "I would like to request time off for next week...",
      timestamp: "10:30 AM",
      unread: true,
      type: "employee",
    },
    {
      id: "2",
      from: "Sarah Johnson",
      subject: "Equipment Issue",
      preview: "The van's AC unit needs maintenance...",
      timestamp: "Yesterday",
      unread: true,
      type: "employee",
    },
    {
      id: "3",
      from: "Smith Residence",
      subject: "Service Feedback",
      preview: "Thank you for the excellent service today...",
      timestamp: "Yesterday",
      unread: false,
      type: "customer",
    },
    {
      id: "4",
      from: "System",
      subject: "Weekly Report Ready",
      preview: "Your weekly performance report is now available...",
      timestamp: "Mon",
      unread: false,
      type: "system",
    },
    {
      id: "5",
      from: "Mike Williams",
      subject: "Question about Schedule",
      preview: "Can I switch shifts with Sarah on Thursday?",
      timestamp: "Mon",
      unread: false,
      type: "employee",
    },
  ];

  const getTypeIcon = (type: AdminMessage["type"]) => {
    switch (type) {
      case "employee":
        return "person-circle-outline";
      case "customer":
        return "home-outline";
      case "system":
        return "notifications-outline";
      default:
        return "mail-outline";
    }
  };

  const getTypeColor = (type: AdminMessage["type"]) => {
    switch (type) {
      case "employee":
        return "#007AFF";
      case "customer":
        return "#34C759";
      case "system":
        return "#FF9500";
      default:
        return "#666";
    }
  };

  const renderMessage = ({ item }: { item: AdminMessage }) => (
    <TouchableOpacity
      style={[styles.messageCard, item.unread && styles.unreadCard]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getTypeIcon(item.type) as any}
          size={24}
          color={getTypeColor(item.type)}
        />
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.from}>{item.from}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <Text
          style={[styles.subject, item.unread && styles.unreadText]}
          numberOfLines={1}
        >
          {item.subject}
        </Text>

        <Text style={styles.preview} numberOfLines={1}>
          {item.preview}
        </Text>
      </View>

      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Admin Inbox</Text>

        <TouchableOpacity onPress={() => router.push("/(admin)/inbox/compose-message")}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>From Team</Text>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#EEF5FF",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  from: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  subject: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
    color: "#000",
  },
  unreadText: {
    fontWeight: "600",
  },
  preview: {
    fontSize: 14,
    color: "#666",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
});
