import { Stack } from "expo-router";

export default function CustomersLayout() {
  return (
    <Stack>
      {/* Customers list screen */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Customer detail screen */}
      <Stack.Screen
        name="[id]"
        options={{
             headerShown: true,
             headerBackTitle: "Customers",
        }}
      />
    </Stack>
  );
}
