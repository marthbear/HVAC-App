import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { addServiceRequest } from "@/src/auth/data/serviceRequests";

export default function ServiceRequestForm() {
  const [formData, setFormData] = useState({
    serviceType: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    preferredDate: "",
  });
  const [isEmergency, setIsEmergency] = useState<boolean | null>(null);
  const [showServiceTooltip, setShowServiceTooltip] = useState(false);

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.description) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }

    if (!formData.serviceType) {
      Alert.alert("Error", "Please select a service type");
      return;
    }

    try {
      // Add service request to database
      await addServiceRequest({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        serviceType: formData.serviceType,
        isEmergency: isEmergency ?? undefined,
        description: formData.description,
        preferredDate: formData.preferredDate || undefined,
      });

      Alert.alert(
        "Success",
        "Service request submitted! We'll contact you shortly.",
        [{ text: "OK" }]
      );

      // Reset form
      setFormData({
        serviceType: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        description: "",
        preferredDate: "",
      });
      setIsEmergency(null);
    } catch (error) {
      Alert.alert("Error", "Failed to submit request. Please try again.");
      console.error("Error submitting service request:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request HVAC Service</Text>
        <Text style={styles.subtitle}>
          Fill out the form below and we'll get back to you shortly
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>
          Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Your full name"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>
          Phone <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="(555) 555-5555"
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Service Address</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="123 Main St, City, State"
          placeholderTextColor="#888"
        />

        <View style={styles.labelWithHelp}>
          <Text style={styles.label}>Service:</Text>
          <View>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setShowServiceTooltip(!showServiceTooltip)}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
            {showServiceTooltip && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  Service Call: System not operating properly and/or NO heat/cool.
                </Text>
                <TouchableOpacity
                  style={styles.tooltipClose}
                  onPress={() => setShowServiceTooltip(false)}
                >
                  <Text style={styles.tooltipCloseText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.serviceType}
            onValueChange={(value) => {
              setFormData({ ...formData, serviceType: value });
              if (value !== "service_call") {
                setIsEmergency(null);
              }
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select a service..." value="" />
            <Picker.Item label="Service call" value="service_call" />
            <Picker.Item label="Preventative maintenance" value="preventative_maintenance" />
            <Picker.Item label="System replacement" value="system_replacement" />
            <Picker.Item label="Speak with comfort specialist" value="speak_with_specialist" />
          </Picker>
        </View>

        {formData.serviceType === "service_call" && (
          <View style={styles.emergencyContainer}>
            <View style={styles.emergencyLabelContainer}>
              <Text style={styles.emergencyLabel}>Is this an emergency?</Text>
              <Text style={styles.emergencyFees}>*additional fees apply</Text>
            </View>
            <View style={styles.emergencyButtons}>
              <TouchableOpacity
                style={[
                  styles.emergencyButton,
                  isEmergency === true && styles.emergencyButtonActive,
                ]}
                onPress={() => setIsEmergency(true)}
              >
                <Text
                  style={[
                    styles.emergencyButtonText,
                    isEmergency === true && styles.emergencyButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.emergencyButton,
                  isEmergency === false && styles.emergencyButtonActive,
                ]}
                onPress={() => setIsEmergency(false)}
              >
                <Text
                  style={[
                    styles.emergencyButtonText,
                    isEmergency === false && styles.emergencyButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.label}>
          Problem Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="Describe the issue you're experiencing..."
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Preferred Date/Time</Text>
        <TextInput
          style={styles.input}
          value={formData.preferredDate}
          onChangeText={(text) =>
            setFormData({ ...formData, preferredDate: text })
          }
          placeholder="e.g., Tomorrow afternoon"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  labelWithHelp: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 1001,
  },
  helpButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  helpButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  tooltip: {
    position: "absolute",
    top: 30,
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: 280,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
  },
  tooltipText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  tooltipClose: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipCloseText: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  emergencyContainer: {
    marginBottom: 20,
  },
  emergencyLabelContainer: {
    marginBottom: 12,
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emergencyFees: {
    fontSize: 12,
    color: "#FF3B30",
    fontStyle: "italic",
    marginTop: 4,
  },
  emergencyButtons: {
    flexDirection: "row",
    gap: 12,
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emergencyButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emergencyButtonTextActive: {
    color: "#fff",
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
