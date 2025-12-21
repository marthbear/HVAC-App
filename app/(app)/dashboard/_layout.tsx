import { Stack } from "expo-router";

/**
 * Stack layout for Dashboard screens.
 */
export default function DashboardLayout() {
  return (
    <Stack>
      {/* Dashboard main */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* All jobs list */}
      <Stack.Screen
        name="all-jobs"
        options={{
          headerShown: true,
          title: "All Jobs",
          headerBackTitle: "Dashboard",
        }}
      />

      {/* Job detail */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Job Details",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
