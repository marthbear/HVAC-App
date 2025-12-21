import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

/**
 * Signup Screen
 *
 * Allows new users to create an account.
 */
export default function SignupScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "employee" as "employee" | "admin" | "customer",
  });

  const handleSignup = () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!formData.password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // TODO: Send to backend to create account
    console.log("Creating account:", formData);

    // Show success and navigate to login
    Alert.alert(
      "Success",
      "Account created successfully! Please log in.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Name Input */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          autoCapitalize="words"
        />

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Phone Input */}
        <Text style={styles.label}>Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="(555) 555-5555"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        {/* Role Selection */}
        <Text style={styles.label}>Account Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.role}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value as "employee" | "admin" | "customer" })
            }
            style={styles.picker}
          >
            <Picker.Item label="Employee" value="employee" />
            <Picker.Item label="Customer" value="customer" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 6 characters"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        {/* Confirm Password Input */}
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
        />

        {/* Signup Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.back()}
        >
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 48,
  },
  button: {
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
