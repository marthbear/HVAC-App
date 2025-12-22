import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";

//Login Screen

export default function LoginScreen(){
    //router used to imperatively navigate to other routes
    const router = useRouter();

    const { login, isAdmin, isEmployee } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    //login handler
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            await login(email, password);

            // Navigation will be handled by the auth state change
            // Check role and redirect accordingly
            setTimeout(() => {
                if (isAdmin) {
                    router.replace("/(admin)/dashboard" as any);
                } else if (isEmployee) {
                    router.replace("/(app)/dashboard");
                } else {
                    router.replace("/(app)/dashboard"); // customers go to employee app for now
                }
            }, 500);
        } catch (error: any) {
            Alert.alert("Login Failed", error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
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
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

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
        </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
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