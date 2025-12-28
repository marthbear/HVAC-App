import { Stack } from "expo-router";

export default function ServiceRequestsLayout() {
  return (
    <Stack>
      {/* Service requests list screen */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Service request detail screen */}
      <Stack.Screen
        name="[id]"
        options={{
             headerShown: true,
             headerBackTitle: "Service Requests",
        }}
      />
    </Stack>
  );
}
