import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="account-details"
        options={{
          headerShown: true,
          title: "Account Details",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="app-settings"
        options={{
          headerShown: true,
          title: "App Settings",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="manage-team"
        options={{
          headerShown: true,
          title: "Manage Team",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="company-settings"
        options={{
          headerShown: true,
          title: "Company Settings",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          headerShown: true,
          title: "Reports",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="help-support"
        options={{
          headerShown: true,
          title: "Help & Support",
          headerBackTitle: "More",
        }}
      />
    </Stack>
  );
}
