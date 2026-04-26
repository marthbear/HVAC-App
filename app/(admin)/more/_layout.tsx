import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "More",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="account-details"
        options={{ title: "Account Details" }}
      />
      <Stack.Screen
        name="app-settings"
        options={{ title: "App Settings" }}
      />
      <Stack.Screen
        name="manage-team"
        options={{ title: "Manage Team" }}
      />
      <Stack.Screen
        name="pending-employees"
        options={{ title: "Pending Employees" }}
      />
      <Stack.Screen
        name="company-settings"
        options={{ title: "Company Settings" }}
      />
      <Stack.Screen
        name="reports"
        options={{ title: "Reports" }}
      />
      <Stack.Screen
        name="help-support"
        options={{ title: "Help & Support" }}
      />
    </Stack>
  );
}
