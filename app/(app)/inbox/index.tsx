import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MESSAGES, Message } from "@/src/auth/data/messages";
import { Ionicons } from "@expo/vector-icons";

/**
 * Inbox screen.
 *
 * Displays a list of messages.
 */
export default function InboxScreen() {
  const router = useRouter();

  /**
   * Render a single inbox message.
   */
  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          item.unread && styles.unread,
        ]}
        onPress={() => {
          router.push({
            pathname: "/(app)/inbox/[id]",
            params: { id: item.id },
          });
        }}
      >
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.timestamp}</Text>
        </View>

        <Text
          style={[
            styles.preview,
            item.unread && styles.unreadText,
          ]}
          numberOfLines={1}
        >
          {item.preview}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
  <Text style={styles.header}>Inbox</Text>

  <TouchableOpacity
    onPress={() => {
      router.push("/(app)/inbox/new");
    }}
  >
    <Ionicons name="add" size={28} color="#007AFF" />
  </TouchableOpacity>
</View>


      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages</Text>
            <Text style={styles.emptyStateSubtext}>Your inbox is empty</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/**
 * Styles for Inbox.
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 16,
  },
  list: {
    paddingBottom: 24,
  },
  messageCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  unread: {
    backgroundColor: "#eef5ff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
    color: "#777",
  },
  preview: {
    fontSize: 14,
    color: "#555",
  },
  unreadText: {
    fontWeight: "500",
  },
  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginVertical: 16,
},
  emptyState: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
});