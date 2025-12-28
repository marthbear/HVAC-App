import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="my-profile"
        options={{
          headerShown: true,
          title: "My Profile",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="time-tracking"
        options={{
          headerShown: true,
          title: "Time Tracking",
          headerBackTitle: "More",
        }}
      />
      <Stack.Screen
        name="my-schedule"
        options={{
          headerShown: true,
          title: "My Schedule",
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
        name="my-reports"
        options={{
          headerShown: true,
          title: "My Reports",
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
