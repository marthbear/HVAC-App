import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";

/**
 * Signup Screen
 *
 * Allows new users to create an account.
 */
export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "employee" as "employee" | "admin" | "customer",
  });

  const handleSignup = async () => {
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

    setLoading(true);
    try {
      // Create account with Firebase
      await signup(formData.email, formData.password, formData.role);

      // Show success and navigate based on role
      Alert.alert(
        "Success",
        "Account created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              if (formData.role === "admin") {
                router.replace("/(admin)/dashboard" as any);
              } else {
                router.replace("/(app)/dashboard");
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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
        <View style={styles.roleButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === "employee" && styles.roleButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, role: "employee" })}
          >
            <Text
              style={[
                styles.roleButtonText,
                formData.role === "employee" && styles.roleButtonTextActive,
              ]}
            >
              Employee
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === "customer" && styles.roleButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, role: "customer" })}
          >
            <Text
              style={[
                styles.roleButtonText,
                formData.role === "customer" && styles.roleButtonTextActive,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === "admin" && styles.roleButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, role: "admin" })}
          >
            <Text
              style={[
                styles.roleButtonText,
                formData.role === "admin" && styles.roleButtonTextActive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
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
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
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
  roleButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  roleButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#EEF5FF",
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
  roleButtonTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  button: {
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
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
