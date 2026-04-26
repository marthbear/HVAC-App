import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/auth/AuthContext";

export default function MyProfileScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "John Smith",
    email: user?.email || "john.smith@hvacpro.com",
    phone: "(555) 234-5678",
    address: "456 Oak Avenue, City, State 12345",
    employeeId: "EMP-001",
    role: "HVAC Technician",
    startDate: "January 15, 2023",
    certifications: "EPA Universal, NATE Certified",
    emergencyContact: "Jane Smith",
    emergencyPhone: "(555) 345-6789",
  });

  const handleSave = () => {
    // In a real app, this would save to database
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // In a real app, reset to original data
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "Password change functionality will be available in the next update."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Edit Button */}
        <View style={styles.headerRow}>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Ionicons name="person" size={60} color="#007AFF" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera-outline" size={18} color="#007AFF" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, name: text })
                }
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.value}>{profileData.name}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.email}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, email: text })
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{profileData.email}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.phone}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, phone: text })
                }
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{profileData.phone}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profileData.address}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, address: text })
                }
                placeholder="Enter your address"
                multiline
                numberOfLines={2}
              />
            ) : (
              <Text style={styles.value}>{profileData.address}</Text>
            )}
          </View>
        </View>

        {/* Work Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Information</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{profileData.employeeId}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{profileData.role}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.value}>{profileData.startDate}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Certifications</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profileData.certifications}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, certifications: text })
                }
                placeholder="Enter your certifications"
                multiline
                numberOfLines={2}
              />
            ) : (
              <Text style={styles.value}>{profileData.certifications}</Text>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contact Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.emergencyContact}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, emergencyContact: text })
                }
                placeholder="Enter emergency contact name"
              />
            ) : (
              <Text style={styles.value}>{profileData.emergencyContact}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profileData.emergencyPhone}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, emergencyPhone: text })
                }
                placeholder="Enter emergency contact phone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{profileData.emergencyPhone}</Text>
            )}
          </View>
        </View>

        {/* Security */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>

            <TouchableOpacity
              style={styles.securityButton}
              onPress={handleChangePassword}
            >
              <View style={styles.securityIcon}>
                <Ionicons name="lock-closed-outline" size={20} color="#007AFF" />
              </View>
              <Text style={styles.securityButtonText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
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
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#000",
    paddingVertical: 8,
  },
  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  securityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  securityButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
});
