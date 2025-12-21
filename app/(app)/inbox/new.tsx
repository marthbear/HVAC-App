import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/**
 * New Message screen.
 *
 * Allows the user to compose a new message.
 *
 */
export default function NewMessageScreen() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Validate inputs
    if (!recipient.trim()) {
      Alert.alert("Error", "Please enter a recipient");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    // TODO: Send message to backend
    console.log("Sending message to:", recipient, "Message:", message);

    // Show success message
    Alert.alert("Success", "Message sent successfully!", [
      {
        text: "OK",
        onPress: () => {
          // Navigate back to inbox
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.label}>To</Text>
        <TextInput
          placeholder="Recipient (employee or admin)"
          style={styles.input}
          value={recipient}
          onChangeText={setRecipient}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          placeholder="Write your message here..."
          style={[styles.input, styles.multiline]}
          multiline
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send Message</Text>
        </TouchableOpacity>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  multiline: {
    height: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  sendText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
