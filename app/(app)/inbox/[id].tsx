import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { MESSAGES } from "@/src/auth/data/messages";

/**
 * Inbox message detail screen.
 *
 * Opened when a user taps a message in the inbox.
 */
export default function InboxMessageDetailScreen() {
  // Get the dynamic route param
  const { id } = useLocalSearchParams<{ id: string }>();

  // Navigation object to control header options
  const navigation = useNavigation();

  // Find the message by ID
  const message = MESSAGES.find((m) => m.id === id);

  // Set header title dynamically
  useEffect(() => {
    if (message) {
      navigation.setOptions({
        title: message.title,
      });
    }
  }, [message, navigation]);

  // Handle missing message
  if (!message) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Message Not Found</Text>
          <Text>This message no longer exists.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
        <Text style={styles.body}>{message.body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#777",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
});
