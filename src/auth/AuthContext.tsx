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
import { doc, getDoc, setDoc, DocumentData, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { AuthUser, UserRole } from "./auth.types";

/**
 * Firestore user document structure
 */
type UserDocument = {
  email: string;
  role: UserRole;
  companyId?: string;
  status: "active" | "pending";
  createdAt: string;
};

/**
 * Company document structure
 */
type CompanyDocument = {
  name: string;
  companyCode: string;
  adminId: string;
  createdAt: string;
};

/**
 * Generate a unique company code
 */
function generateCompanyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars
  let code = "HVAC-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Public interface for authentication context.
 */
type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: UserRole; status: "active" | "pending" }>;
  signup: (email: string, password: string, role: UserRole, companyCode?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Role helpers
  isEmployee: boolean;
  isAdmin: boolean;
  isCustomer: boolean;

  // Company and status
  companyId?: string;
  status?: "active" | "pending";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider wraps the app and manages auth state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Holds the authenticated user (null = logged out)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<"active" | "pending" | undefined>(undefined);

  /**
   * Listen to Firebase auth state changes.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data() as UserDocument | undefined;

          const authUser: AuthUser = {
            id: firebaseUser.uid,
            role: userData?.role || "customer",
            email: firebaseUser.email || undefined,
          };

          setUser(authUser);
          setCompanyId(userData?.companyId);
          setStatus(userData?.status || "active");
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setCompanyId(undefined);
          setStatus(undefined);
        }
      } else {
        // User is signed out
        setUser(null);
        setCompanyId(undefined);
        setStatus(undefined);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password.
   */
  const login = async (email: string, password: string): Promise<{ role: UserRole; status: "active" | "pending" }> => {
    try {
      console.log("Attempting login for:", email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful, user ID:", userCredential.user.uid);

      // Fetch user role and status from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data() as UserDocument | undefined;
      const role = userData?.role || "customer";
      const status = userData?.status || "active";

      console.log("User role:", role, "Status:", status);

      // onAuthStateChanged will handle setting the user state
      return { role, status };
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        email: email,
        fullError: error,
      });

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
  const signup = async (email: string, password: string, role: UserRole, companyCode?: string) => {
    try {
      console.log("Starting signup for:", email, "as", role);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userId = userCredential.user.uid;
      console.log("User created in Firebase Auth:", userId);

      // Handle different roles
      if (role === "admin") {
        console.log("Creating company for admin...");
        // Admin: Create company with unique code
        const newCompanyCode = generateCompanyCode();
        const companyRef = doc(collection(db, "companies"));
        const companyId = companyRef.id;

        await setDoc(companyRef, {
          name: "My HVAC Company", // Default name, can be updated in settings
          companyCode: newCompanyCode,
          adminId: userId,
          createdAt: new Date().toISOString(),
        } as CompanyDocument);

        console.log("Company created:", companyId, "with code:", newCompanyCode);

        // Create admin user with company
        await setDoc(doc(db, "users", userId), {
          email,
          role,
          companyId,
          status: "active",
          createdAt: new Date().toISOString(),
        } as UserDocument);

        console.log("Admin user document created");
      } else if (role === "employee") {
        // Employee: Validate company code and create pending user
        if (!companyCode) {
          throw new Error("Company code is required for employees");
        }

        // Find company by code
        const companiesRef = collection(db, "companies");
        const q = query(companiesRef, where("companyCode", "==", companyCode.trim().toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Invalid company code. Please check with your administrator.");
        }

        const companyDoc = querySnapshot.docs[0];
        const companyId = companyDoc.id;

        // Create employee user with pending status
        await setDoc(doc(db, "users", userId), {
          email,
          role,
          companyId,
          status: "pending",
          createdAt: new Date().toISOString(),
        } as UserDocument);
      } else {
        // Customer: No company association needed
        await setDoc(doc(db, "users", userId), {
          email,
          role,
          status: "active",
          createdAt: new Date().toISOString(),
        } as UserDocument);
      }

      // onAuthStateChanged will handle setting the user
      console.log("Signup completed successfully");
    } catch (error: any) {
      console.error("Signup error details:", {
        message: error.message,
        code: error.code,
        fullError: error,
      });

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

        // Company and status
        companyId,
        status,
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