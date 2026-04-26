import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/src/config/firebase";
import { useAuth } from "@/src/auth/AuthContext";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function HelpSupportScreen() {
  const { user } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [bugModalVisible, setBugModalVisible] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I clock in and out?",
      answer:
        "Go to More > Time Tracking, then tap the 'Clock In' button when you start your shift. When you're done, tap 'Clock Out'. The app will track your hours automatically.",
    },
    {
      id: "2",
      question: "How do I view my schedule?",
      answer:
        "You can view your schedule in two ways: 1) Go to the Schedule tab to see all your jobs for the week, or 2) Go to More > My Schedule for a detailed view with filtering options.",
    },
    {
      id: "3",
      question: "How do I update my profile information?",
      answer:
        "Navigate to More > My Profile, then tap the 'Edit' button in the top right. Update your information and tap 'Save' when you're done.",
    },
    {
      id: "4",
      question: "Can I see my performance metrics?",
      answer:
        "Yes! Go to More > My Reports to view your jobs completed, total hours worked, earnings, and customer ratings. You can filter by week, month, quarter, or year.",
    },
    {
      id: "5",
      question: "What if I need to change my password?",
      answer:
        "Go to More > My Profile, scroll down to the Security section, and tap 'Change Password'. Follow the prompts to set a new password.",
    },
    {
      id: "6",
      question: "How do I report a problem with a job?",
      answer:
        "Contact your supervisor immediately. You can also use the 'Report a Bug' option in this Help & Support screen to document any technical issues with the app.",
    },
    {
      id: "7",
      question: "Can I export my work reports?",
      answer:
        "Yes! Go to More > My Reports and scroll to the bottom. You can export your reports as PDF, Excel, or email them directly.",
    },
    {
      id: "8",
      question: "How do I turn off notifications?",
      answer:
        "Go to More > App Settings, then adjust the notification settings under the Notifications section. You can toggle push, email, and SMS notifications on or off.",
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@hvacpro.com?subject=Support Request");
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+15551234567");
  };

  const handleReportBug = () => {
    setBugModalVisible(true);
  };

  const submitBugReport = async () => {
    if (!bugTitle.trim() || !bugDescription.trim()) {
      Alert.alert("Error", "Please fill in both title and description");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "bugReports"), {
        title: bugTitle.trim(),
        description: bugDescription.trim(),
        reportedBy: user?.email || "Unknown",
        userId: user?.uid || null,
        userRole: "employee",
        status: "new",
        createdAt: new Date().toISOString(),
      });

      setBugModalVisible(false);
      setBugTitle("");
      setBugDescription("");
      Alert.alert(
        "Thank You!",
        "Your bug report has been submitted. We'll look into it as soon as possible."
      );
    } catch (error) {
      console.error("Error submitting bug report:", error);
      Alert.alert("Error", "Failed to submit bug report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeatureRequest = () => {
    Linking.openURL(
      "mailto:support@hvacpro.com?subject=Feature Request&body=Please describe the feature you'd like to see:"
    );
  };

  const handleViewDocs = () => {
    Alert.alert(
      "Documentation",
      "Full documentation will be available at docs.hvacpro.com"
    );
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleContactSupport}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="mail-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Contact Support</Text>
              <Text style={styles.actionDescription}>
                Email us at support@hvacpro.com
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCallSupport}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="call-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Call Support</Text>
              <Text style={styles.actionDescription}>(555) 123-4567</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReportBug}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="bug-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Report a Bug</Text>
              <Text style={styles.actionDescription}>
                Let us know what went wrong
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFeatureRequest}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="bulb-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Request a Feature</Text>
              <Text style={styles.actionDescription}>
                Suggest improvements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewDocs}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="book-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Documentation</Text>
              <Text style={styles.actionDescription}>
                View full user guide
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={
                    expandedFAQ === faq.id
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#666"
                />
              </View>
              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2025.12.26</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.contactRow}>
            <Ionicons name="mail" size={18} color="#666" />
            <Text style={styles.contactText}>support@hvacpro.com</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call" size={18} color="#666" />
            <Text style={styles.contactText}>(555) 123-4567</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="time" size={18} color="#666" />
            <Text style={styles.contactText}>
              Monday - Friday, 9:00 AM - 5:00 PM EST
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bug Report Modal */}
      <Modal
        visible={bugModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBugModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setBugModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report a Bug</Text>
            <TouchableOpacity onPress={submitBugReport} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.modalSubmit}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Bug Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of the issue"
              value={bugTitle}
              onChangeText={setBugTitle}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Please describe what happened, what you expected to happen, and steps to reproduce the issue..."
              value={bugDescription}
              onChangeText={setBugDescription}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <Text style={styles.helperText}>
              Include as much detail as possible to help us fix the issue quickly.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: "#666",
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalCancel: {
    fontSize: 16,
    color: "#666",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  modalSubmit: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },
});
