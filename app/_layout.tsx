import { Stack } from "expo-router";
import { AuthProvider } from "../src/auth/AuthContext";

/**
 * Root layout.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}