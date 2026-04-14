import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import {
  getConversations,
  getUnreadCount,
  formatMessageTime,
  Conversation,
} from "@/src/services/messaging";

export default function AdminInboxScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const [convs, unread] = await Promise.all([
        getConversations(),
        getUnreadCount(),
      ]);
      setConversations(convs);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getTypeIcon = (type: Conversation["participantType"]) => {
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

  const getTypeColor = (type: Conversation["participantType"]) => {
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

  const getTypeLabel = (type: Conversation["participantType"]) => {
    switch (type) {
      case "employee":
        return "Employee";
      case "customer":
        return "Customer";
      case "system":
        return "Alert";
      default:
        return "";
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: "/(admin)/inbox/[id]",
      params: { id: conversation.id },
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.messageCard,
        { backgroundColor: item.unread ? theme.primaryLight : theme.surface },
      ]}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.participantType) + "15" }]}>
        <Ionicons
          name={getTypeIcon(item.participantType) as any}
          size={24}
          color={getTypeColor(item.participantType)}
        />
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.senderRow}>
            <Text style={[styles.from, { color: theme.text }]} numberOfLines={1}>
              {item.participantName}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.participantType) + "20" }]}>
              <Text style={[styles.typeBadgeText, { color: getTypeColor(item.participantType) }]}>
                {getTypeLabel(item.participantType)}
              </Text>
            </View>
          </View>
          <Text style={[styles.timestamp, { color: theme.textMuted }]}>
            {formatMessageTime(item.lastMessageTime)}
          </Text>
        </View>

        <Text
          style={[
            styles.subject,
            { color: theme.text },
            item.unread && styles.unreadText,
          ]}
          numberOfLines={1}
        >
          {item.subject}
        </Text>

        <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {item.unread && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 9 ? "9+" : item.unreadCount}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const employeeCount = conversations.filter((c) => c.participantType === "employee").length;
  const customerCount = conversations.filter((c) => c.participantType === "customer").length;
  const systemCount = conversations.filter((c) => c.participantType === "system").length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Inbox</Text>

        <TouchableOpacity
          style={[styles.composeButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/(admin)/inbox/compose-message")}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: unreadCount > 0 ? "#EF4444" : theme.primary }]}>
            {unreadCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Unread</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: "#007AFF" }]}>{employeeCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Team</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: "#34C759" }]}>{customerCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Customers</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: "#FF9500" }]}>{systemCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Alerts</Text>
        </View>
      </View>

      {/* Message List */}
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-open-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Messages</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your inbox is empty
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  messageCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  from: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  subject: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: "700",
  },
  preview: {
    fontSize: 13,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
});
