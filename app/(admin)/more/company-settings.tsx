import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../src/config/firebase";
import { useAuth } from "../../../src/auth/AuthContext";
import { Stack } from "expo-router";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

type BusinessHours = {
  [K in DayOfWeek]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
};

export default function CompanySettingsScreen() {
  const { companyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyCode, setCompanyCode] = useState("");

  const [companyInfo, setCompanyInfo] = useState({
    name: "HVAC Pro Services",
    address: "123 Main Street, City, State 12345",
    phone: "(555) 123-4567",
    email: "info@hvacpro.com",
    website: "www.hvacpro.com",
    taxRate: "8.5",
    serviceRadius: "50",
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { isOpen: true, openTime: "8:00 AM", closeTime: "5:00 PM" },
    tuesday: { isOpen: true, openTime: "8:00 AM", closeTime: "5:00 PM" },
    wednesday: { isOpen: true, openTime: "8:00 AM", closeTime: "5:00 PM" },
    thursday: { isOpen: true, openTime: "8:00 AM", closeTime: "5:00 PM" },
    friday: { isOpen: true, openTime: "8:00 AM", closeTime: "5:00 PM" },
    saturday: { isOpen: false, openTime: "9:00 AM", closeTime: "2:00 PM" },
    sunday: { isOpen: false, openTime: "Closed", closeTime: "Closed" },
  });

  const [emergencyService, setEmergencyService] = useState(true);
  const [autoInvoicing, setAutoInvoicing] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    if (!companyId) {
      console.log("No companyId found in auth context");
      setLoading(false);
      return;
    }

    try {
      console.log("Loading company data for ID:", companyId);
      const companyDoc = await getDoc(doc(db, "companies", companyId));

      if (companyDoc.exists()) {
        const data = companyDoc.data();
        console.log("Company data:", data);
        setCompanyCode(data.companyCode || "");
        if (data.name) {
          setCompanyInfo((prev) => ({ ...prev, name: data.name }));
        }
      } else {
        console.log("Company document does not exist");
        Alert.alert("Error", "Company not found. Please contact support.");
      }
    } catch (error) {
      console.error("Error loading company data:", error);
      Alert.alert("Error", "Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to database
    Alert.alert("Success", "Company settings saved successfully!");
  };

  const toggleDayOpen = (day: DayOfWeek) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        isOpen: !businessHours[day].isOpen,
      },
    });
  };

  const handleCopyCode = () => {
    Clipboard.setString(companyCode);
    Alert.alert("Copied!", "Company code copied to clipboard");
  };

  const generateCompanyCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "HVAC-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleRegenerateCode = async () => {
    Alert.alert(
      "Regenerate Company Code",
      "Are you sure? The old code will stop working and employees will need the new code to join.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: async () => {
            if (!companyId) return;

            try {
              const newCode = generateCompanyCode();
              const companyRef = doc(db, "companies", companyId);
              await updateDoc(companyRef, {
                companyCode: newCode,
              });

              setCompanyCode(newCode);
              Alert.alert("Success", "Company code has been regenerated");
            } catch (error) {
              console.error("Error regenerating code:", error);
              Alert.alert("Error", "Failed to regenerate code");
            }
          },
        },
      ]
    );
  };

  const dayLabels: { [K in DayOfWeek]: string } = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Company Settings", headerShown: true }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Company Settings", headerShown: true }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.header}>Company Settings</Text>

        {/* Company Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Code</Text>
          <Text style={styles.sectionDescription}>
            Share this code with employees so they can join your company
          </Text>

          <View style={styles.codeContainer}>
            <View style={styles.codeBox}>
              <Ionicons name="key-outline" size={24} color="#007AFF" />
              <Text style={styles.codeText}>
                {companyCode || "Loading..."}
              </Text>
            </View>

            <View style={styles.codeActions}>
              <TouchableOpacity
                style={[styles.codeButton, !companyCode && styles.buttonDisabled]}
                onPress={handleCopyCode}
                disabled={!companyCode}
              >
                <Ionicons name="copy-outline" size={20} color="#007AFF" />
                <Text style={styles.codeButtonText}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.codeButton, !companyCode && styles.buttonDisabled]}
                onPress={handleRegenerateCode}
                disabled={!companyCode}
              >
                <Ionicons name="refresh-outline" size={20} color="#FF9500" />
                <Text style={[styles.codeButtonText, { color: "#FF9500" }]}>
                  Regenerate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.name}
              onChangeText={(text) =>
                setCompanyInfo({ ...companyInfo, name: text })
              }
              placeholder="Enter company name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.address}
              onChangeText={(text) =>
                setCompanyInfo({ ...companyInfo, address: text })
              }
              placeholder="Enter company address"
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={companyInfo.phone}
                onChangeText={(text) =>
                  setCompanyInfo({ ...companyInfo, phone: text })
                }
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={companyInfo.email}
                onChangeText={(text) =>
                  setCompanyInfo({ ...companyInfo, email: text })
                }
                placeholder="email@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.website}
              onChangeText={(text) =>
                setCompanyInfo({ ...companyInfo, website: text })
              }
              placeholder="www.company.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>

          {(Object.keys(businessHours) as DayOfWeek[]).map((day) => (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>
                  {dayLabels[day]}
                </Text>
                <Switch
                  value={businessHours[day].isOpen}
                  onValueChange={() => toggleDayOpen(day)}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={businessHours[day].isOpen ? "#007AFF" : "#f4f3f4"}
                />
              </View>
              {businessHours[day].isOpen && (
                <View style={styles.timeRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={businessHours[day].openTime}
                    onChangeText={(text) =>
                      setBusinessHours({
                        ...businessHours,
                        [day]: { ...businessHours[day], openTime: text },
                      })
                    }
                    placeholder="8:00 AM"
                  />
                  <Text style={styles.timeSeparator}>to</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={businessHours[day].closeTime}
                    onChangeText={(text) =>
                      setBusinessHours({
                        ...businessHours,
                        [day]: { ...businessHours[day], closeTime: text },
                      })
                    }
                    placeholder="5:00 PM"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Service Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Radius (miles)</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.serviceRadius}
              onChangeText={(text) =>
                setCompanyInfo({ ...companyInfo, serviceRadius: text })
              }
              placeholder="50"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>24/7 Emergency Service</Text>
              <Text style={styles.settingDescription}>
                Accept emergency service requests outside business hours
              </Text>
            </View>
            <Switch
              value={emergencyService}
              onValueChange={setEmergencyService}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={emergencyService ? "#007AFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Billing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Default Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={companyInfo.taxRate}
              onChangeText={(text) =>
                setCompanyInfo({ ...companyInfo, taxRate: text })
              }
              placeholder="8.5"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Automatic Invoicing</Text>
              <Text style={styles.settingDescription}>
                Automatically send invoices when jobs are completed
              </Text>
            </View>
            <Switch
              value={autoInvoicing}
              onValueChange={setAutoInvoicing}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={autoInvoicing ? "#007AFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  codeContainer: {
    marginTop: 8,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  codeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: "row",
    gap: 12,
  },
  codeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  codeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dayRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 14,
    color: "#666",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
