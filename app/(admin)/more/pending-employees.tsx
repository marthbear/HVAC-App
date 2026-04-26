import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../src/config/firebase";
import { useAuth } from "../../../src/auth/AuthContext";

type PendingEmployee = {
  id: string;
  email: string;
  createdAt: string;
};

export default function PendingEmployeesScreen() {
  const { companyId } = useAuth();
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    type: "approve" | "reject";
    employeeId: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    loadPendingEmployees();
  }, [companyId]);

  const loadPendingEmployees = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("companyId", "==", companyId),
        where("status", "==", "pending"),
        where("role", "==", "employee")
      );

      const querySnapshot = await getDocs(q);
      const employees: PendingEmployee[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          email: data.email,
          createdAt: data.createdAt,
        });
      });

      // Sort by createdAt (newest first)
      employees.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPendingEmployees(employees);
    } catch (error) {
      console.error("Error loading pending employees:", error);
      Alert.alert("Error", "Failed to load pending employees");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (employeeId: string, email: string) => {
    console.log("handleApprove called for:", employeeId, email);
    if (Platform.OS === "web") {
      setConfirmModal({ visible: true, type: "approve", employeeId, email });
    } else {
      Alert.alert(
        "Approve Employee",
        `Are you sure you want to approve ${email}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Approve",
            onPress: () => confirmApprove(employeeId, email),
          },
        ]
      );
    }
  };

  const confirmApprove = async (employeeId: string, email: string) => {
    setConfirmModal(null);
    setActionLoading(employeeId);
    try {
      console.log("Approving employee:", employeeId);
      const userRef = doc(db, "users", employeeId);
      console.log("Updating document...");
      await updateDoc(userRef, {
        status: "active",
      });
      console.log("Document updated successfully");

      if (Platform.OS === "web") {
        window.alert(`${email} has been approved`);
      } else {
        Alert.alert("Success", `${email} has been approved`);
      }
      // Reload the list
      await loadPendingEmployees();
    } catch (error: any) {
      console.error("Error approving employee:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      const errorMsg = error?.message || "Failed to approve employee";
      if (Platform.OS === "web") {
        window.alert(`Failed to approve employee: ${errorMsg}`);
      } else {
        Alert.alert("Error", `Failed to approve employee: ${errorMsg}`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (employeeId: string, email: string) => {
    console.log("handleReject called for:", employeeId, email);
    if (Platform.OS === "web") {
      setConfirmModal({ visible: true, type: "reject", employeeId, email });
    } else {
      Alert.alert(
        "Reject Employee",
        `Are you sure you want to reject ${email}? Their account will be deleted.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: () => confirmReject(employeeId, email),
          },
        ]
      );
    }
  };

  const confirmReject = async (employeeId: string, email: string) => {
    setConfirmModal(null);
    setActionLoading(employeeId);
    try {
      // Delete the user document
      const userRef = doc(db, "users", employeeId);
      await deleteDoc(userRef);

      if (Platform.OS === "web") {
        window.alert(`${email} has been rejected`);
      } else {
        Alert.alert("Rejected", `${email} has been rejected`);
      }
      // Reload the list
      await loadPendingEmployees();
    } catch (error) {
      console.error("Error rejecting employee:", error);
      if (Platform.OS === "web") {
        window.alert("Failed to reject employee");
      } else {
        Alert.alert("Error", "Failed to reject employee");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading pending employees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {pendingEmployees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubtext}>
              New employee signups will appear here for approval
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.headerRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.sectionSubtitle}>
                {pendingEmployees.length}{" "}
                {pendingEmployees.length === 1 ? "request" : "requests"} awaiting
                approval
              </Text>
            </View>

            {pendingEmployees.map((employee) => (
              <View key={employee.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeIcon}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                    <Text style={styles.employeeTime}>
                      Requested {formatDate(employee.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.rejectButton,
                      actionLoading === employee.id && styles.buttonDisabled,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      console.log("Reject button pressed");
                      handleReject(employee.id, employee.email);
                    }}
                    disabled={actionLoading === employee.id}
                  >
                    {actionLoading === employee.id ? (
                      <ActivityIndicator size="small" color="#FF3B30" />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.approveButton,
                      actionLoading === employee.id && styles.buttonDisabled,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      console.log("Approve button pressed");
                      handleApprove(employee.id, employee.email);
                    }}
                    disabled={actionLoading === employee.id}
                  >
                    {actionLoading === employee.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal for Web */}
      {confirmModal && (
        <Modal
          visible={confirmModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {confirmModal.type === "approve" ? "Approve Employee" : "Reject Employee"}
              </Text>
              <Text style={styles.modalMessage}>
                {confirmModal.type === "approve"
                  ? `Are you sure you want to approve ${confirmModal.email}?`
                  : `Are you sure you want to reject ${confirmModal.email}? Their account will be deleted.`}
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setConfirmModal(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalButton,
                    confirmModal.type === "approve"
                      ? styles.modalApproveButton
                      : styles.modalRejectButton,
                  ]}
                  onPress={() => {
                    if (confirmModal.type === "approve") {
                      confirmApprove(confirmModal.employeeId, confirmModal.email);
                    } else {
                      confirmReject(confirmModal.employeeId, confirmModal.email);
                    }
                  }}
                >
                  <Text style={styles.modalActionText}>
                    {confirmModal.type === "approve" ? "Approve" : "Reject"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  employeeCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  employeeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  employeeTime: {
    fontSize: 13,
    color: "#666",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF3B30",
  },
  approveButton: {
    backgroundColor: "#34C759",
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f0f0f0",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalApproveButton: {
    backgroundColor: "#34C759",
  },
  modalRejectButton: {
    backgroundColor: "#FF3B30",
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
