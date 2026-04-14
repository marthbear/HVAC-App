import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

/**
 * Theme color definitions
 */
export const lightTheme = {
  background: "#f7f7f7",
  surface: "#ffffff",
  text: "#000000",
  textSecondary: "#666666",
  textMuted: "#999999",
  border: "#e0e0e0",
  borderLight: "#f0f0f0",
  primary: "#007AFF",
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
  statusBarStyle: "dark-content" as const,
};

export const darkTheme = {
  background: "#000000",
  surface: "#1c1c1e",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  textMuted: "#666666",
  border: "#38383a",
  borderLight: "#2c2c2e",
  primary: "#0a84ff",
  success: "#30d158",
  warning: "#ff9f0a",
  error: "#ff453a",
  statusBarStyle: "light-content" as const,
};

export type Theme = typeof lightTheme;

type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@hvac_app_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  // Determine if dark mode is active
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  const theme = isDark ? darkTheme : lightTheme;

  // Save and update theme mode
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    setThemeMode(newMode);
  };

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, themeMode, setThemeMode, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
