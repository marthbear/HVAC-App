import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";

/**
 * Root route.
 *
 * Controls where users land based on auth state.
 */
export default function Index() {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Not logged in = go to login screen
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // Employee goes to employee dashboard
  if (user?.role === "employee") {
    return <Redirect href="/(app)/dashboard" />;
  }

  // Admin goes to admin dashboard
  if (user?.role === "admin") {
    return <Redirect href={"/(admin)/dashboard" as any} />;
  }

  // Fallback safety redirect
  return <Redirect href="/login" />;
}
