import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { Ionicons } from "@expo/vector-icons";

//Login Screen

export default function LoginScreen(){
    //router used to imperatively navigate to other routes
    const router = useRouter();

    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    //login handler
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            const { role, status } = await login(email, password);

            // Check if employee is pending approval
            if (role === "employee" && status === "pending") {
                router.replace("/(app)/pending-approval");
                return;
            }

            // Navigate based on user role
            if (role === "admin") {
                router.replace("/(admin)/dashboard" as any);
            } else if (role === "employee") {
                router.replace("/(app)/dashboard");
            } else {
                router.replace("/(app)/dashboard"); // customers go to employee app for now
            }
        } catch (error: any) {
            Alert.alert("Login Failed", error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/*App Title and Logo*/ }
            <Text style={styles.title}>HVAC Service Portal</Text>

            {/*email input*/}
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            {/*Password Input*/}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                )}
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/signup")}
            >
                <Text style={styles.linkText}>Don't have an account? Create one</Text>
            </TouchableOpacity>
        </ScrollView>
    );

}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 13,
    padding: 4,
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
    fontWeight: "500",
  },
  linkButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});