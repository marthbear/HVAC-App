import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser, UserRole } from "./auth.types";
import { AUTH_STORAGE_KEY } from "./auth.storage";

/**
 * Public interface for authentication context.
 */
type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;

  // Role helpers
  isEmployee: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider wraps the app and manages auth state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Holds the authenticated user (null = logged out)
  const [user, setUser] = useState<AuthUser | null>(null);

  
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load persisted auth state when the app starts.
   */
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Retrieve stored user JSON string
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (storedUser) {
          // Parse and restore user
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.warn("Failed to load auth state", error);
      } finally {
        // Mark loading complete no matter what
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * Log the user in and persist role.
   */
  const login = async (role: UserRole) => {
  const authUser: AuthUser = {
    id: "employee-001",
    // Temporary, predictable ID for employee-first development
    // This will later be replaced by Firebase Auth UID

    role,
  };

  setUser(authUser);

  await AsyncStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(authUser)
  );
};

  /**
   * Log the user out and clear persisted state.
   */
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
  <AuthContext.Provider
    value={{
      user,
      isLoggedIn: user !== null,
      isLoading,
      login,
      logout,

      // Role helpers — derived from user.role
      isEmployee: user?.role === "employee",
      isAdmin: user?.role === "admin",
      isCustomer: user?.role === "customer",
    }}
  >
    {children}
  </AuthContext.Provider>
);
}

/**
 * Safe hook for consuming auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}