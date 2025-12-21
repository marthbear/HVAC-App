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

type ContactType = "employee" | "customer";

export default function NewContactScreen() {
  const router = useRouter();
  const [contactType, setContactType] = useState<ContactType>("employee");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [address, setAddress] = useState("");

  const handleSave = () => {
    // TODO: Implement save contact logic
    console.log("Saving contact:", {
      contactType,
      name,
      phone,
      email,
      role,
      address,
    });
    router.back();
  };

  const isFormValid = () => {
    if (contactType === "employee") {
      return name && phone && email && role;
    } else {
      return name && phone && address;
    }
  };

  const ContactTypeButton = ({
    type,
    label,
    icon,
  }: {
    type: ContactType;
    label: string;
    icon: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        contactType === type && styles.typeButtonActive,
      ]}
      onPress={() => setContactType(type)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={contactType === type ? "#007AFF" : "#999"}
      />
      <Text
        style={[
          styles.typeButtonText,
          contactType === type && styles.typeButtonTextActive,
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
          <Text style={styles.headerTitle}>New Contact</Text>
          <TouchableOpacity onPress={handleSave} disabled={!isFormValid()}>
            <Text
              style={[
                styles.saveButton,
                !isFormValid() && styles.saveButtonDisabled,
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Contact Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Contact Type</Text>
            <View style={styles.typeButtonRow}>
              <ContactTypeButton
                type="employee"
                label="Employee"
                icon="person-circle-outline"
              />
              <ContactTypeButton
                type="customer"
                label="Customer"
                icon="home-outline"
              />
            </View>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          {/* Phone */}
          <View style={styles.section}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="(804) 555-0100"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Employee-specific fields */}
          {contactType === "employee" && (
            <>
              {/* Email */}
              <View style={styles.section}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@hvac.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Role */}
              <View style={styles.section}>
                <Text style={styles.label}>Role *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Senior Technician"
                  value={role}
                  onChangeText={setRole}
                  placeholderTextColor="#999"
                />
              </View>
            </>
          )}

          {/* Customer-specific fields */}
          {contactType === "customer" && (
            <>
              {/* Email (optional for customers) */}
              <View style={styles.section}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Address */}
              <View style={styles.section}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter full address"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
            </>
          )}

          {/* Info Text */}
          <Text style={styles.infoText}>* Required fields</Text>
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
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  saveButtonDisabled: {
    color: "#ccc",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
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
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  infoText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
});
