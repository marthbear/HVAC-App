import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { AuthProvider } from "../src/auth/AuthContext";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

/**
 * Inner layout that uses theme
 */
function ThemedLayout() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

/**
 * Root layout.
 */
export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <ThemedLayout />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}