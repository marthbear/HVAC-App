import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { Ionicons } from "@expo/vector-icons";

/**
 * Signup Screen
 *
 * Allows new users to create an account.
 */
export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "employee" as "employee" | "admin" | "customer",
    companyCode: "",
  });

  const handleSignup = async () => {
    console.log("handleSignup called with:", formData);

    // Validate form
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Validation Error", "Please enter your email");
      return;
    }

    if (formData.role === "employee" && !formData.companyCode.trim()) {
      Alert.alert("Validation Error", "Please enter your company code");
      return;
    }

    if (!formData.password) {
      Alert.alert("Validation Error", "Please enter a password");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    console.log("All validations passed, starting signup...");
    console.log("Form data:", JSON.stringify(formData, null, 2));

    setLoading(true);
    try {
      // Create account with Firebase
      console.log("Calling signup with:", formData.email, formData.role, formData.companyCode);
      await signup(
        formData.email,
        formData.password,
        formData.role,
        formData.role === "employee" ? formData.companyCode : undefined
      );
      console.log("Signup successful!");

      // Show success message
      setShowSuccess(true);

      // Navigate after a short delay
      setTimeout(() => {
        if (formData.role === "admin") {
          router.replace("/(admin)/dashboard" as any);
        } else if (formData.role === "employee") {
          // Employee will be pending, redirect to pending approval screen
          router.replace("/(app)/pending-approval");
        } else {
          router.replace("/(app)/dashboard");
        }
      }, 1500);
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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

        {/* Company Code Input (Employee Only) */}
        {formData.role === "employee" && (
          <>
            <Text style={styles.label}>Company Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter code from your employer"
              value={formData.companyCode}
              onChangeText={(text) =>
                setFormData({ ...formData, companyCode: text.toUpperCase() })
              }
              autoCapitalize="characters"
            />
          </>
        )}

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

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

        {/* Success Message */}
        {showSuccess && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.successText}>
              Account created successfully! Redirecting...
            </Text>
          </View>
        )}
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
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 13,
    padding: 4,
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
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  successText: {
    color: "#34C759",
    fontSize: 15,
    fontWeight: "600",
  },
});
