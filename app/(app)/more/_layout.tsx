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
        name="my-profile"
        options={{ title: "My Profile" }}
      />
      <Stack.Screen
        name="time-tracking"
        options={{ title: "Time Tracking" }}
      />
      <Stack.Screen
        name="my-schedule"
        options={{ title: "My Schedule" }}
      />
      <Stack.Screen
        name="app-settings"
        options={{ title: "App Settings" }}
      />
      <Stack.Screen
        name="my-reports"
        options={{ title: "My Reports" }}
      />
      <Stack.Screen
        name="help-support"
        options={{ title: "Help & Support" }}
      />
      <Stack.Screen
        name="my-company"
        options={{ title: "My Company" }}
      />
    </Stack>
  );
}
