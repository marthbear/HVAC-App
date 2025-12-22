import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { AuthUser, UserRole } from "./auth.types";

/**
 * Public interface for authentication context.
 */
type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;

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
   * Listen to Firebase auth state changes.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();

          const authUser: AuthUser = {
            id: firebaseUser.uid,
            role: userData?.role || "customer",
            email: firebaseUser.email || undefined,
          };

          setUser(authUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password.
   */
  const login = async (email: string, password: string): Promise<UserRole> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();
      const role = userData?.role || "customer";

      // onAuthStateChanged will handle setting the user state
      return role;
    } catch (error: any) {
      console.error("Login error:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to log in";

      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  /**
   * Create a new user account.
   */
  const signup = async (email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store user role in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      // onAuthStateChanged will handle setting the user
    } catch (error: any) {
      console.error("Signup error:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to create account";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please use a different email or try logging in.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  /**
   * Log the user out.
   */
  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing the user
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to log out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isLoading,
        login,
        signup,
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