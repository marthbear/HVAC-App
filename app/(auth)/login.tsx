import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";


//Login Screen

export default function LoginScreen(){
    //router used to imperatively navigate to other routes
    const router = useRouter();

    const { login } = useAuth();


    //temporary login handlers
    const handleAdminLogin = () => {
        login("admin");
        router.replace("/(admin)/dashboard" as any);
    };

    const handleEmployeeLogin = () => {
        login("employee");
        router.replace("/(app)/dashboard");
    };

    /*
    //previous temp login handler
    const handleLogin = () => {
        router.replace("/dashboard");
    };
    */
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
                />

            {/*Password Input*/}
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                />
            
            <TouchableOpacity style={styles.button} onPress={handleEmployeeLogin}>
                <Text style={styles.buttonText}>Employee Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: "#444" }]} onPress={handleAdminLogin}>
                <Text style={styles.buttonText}>Admin Login</Text>
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