import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ComposeMessageScreen() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<
    "employee" | "customer" | "all"
  >("employee");

  const handleSend = () => {
    // TODO: Implement send message logic
    console.log("Sending message:", { recipient, subject, message, recipientType });
    router.back();
  };

  const RecipientTypeButton = ({
    type,
    label,
    icon,
  }: {
    type: "employee" | "customer" | "all";
    label: string;
    icon: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        recipientType === type && styles.typeButtonActive,
      ]}
      onPress={() => setRecipientType(type)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={recipientType === type ? "#007AFF" : "#999"}
      />
      <Text
        style={[
          styles.typeButtonText,
          recipientType === type && styles.typeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!recipient || !subject || !message}
          >
            <Text
              style={[
                styles.sendButton,
                (!recipient || !subject || !message) && styles.sendButtonDisabled,
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Recipient Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Send To</Text>
            <View style={styles.typeButtonRow}>
              <RecipientTypeButton
                type="employee"
                label="Employee"
                icon="person-circle-outline"
              />
              <RecipientTypeButton
                type="customer"
                label="Customer"
                icon="home-outline"
              />
              <RecipientTypeButton
                type="all"
                label="All"
                icon="people-outline"
              />
            </View>
          </View>

          {/* Recipient */}
          <View style={styles.section}>
            <Text style={styles.label}>Recipient</Text>
            <TextInput
              style={styles.input}
              placeholder={
                recipientType === "employee"
                  ? "Enter employee name"
                  : recipientType === "customer"
                  ? "Enter customer name"
                  : "All users"
              }
              value={recipient}
              onChangeText={setRecipient}
              placeholderTextColor="#999"
            />
          </View>

          {/* Subject */}
          <View style={styles.section}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter subject"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="#999"
            />
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Type your message here..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  sendButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  sendButtonDisabled: {
    color: "#ccc",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  typeButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  typeButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#EEF5FF",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  typeButtonTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  messageInput: {
    minHeight: 200,
    paddingTop: 14,
  },
});
