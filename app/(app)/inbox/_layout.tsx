import { Stack } from "expo-router";

/**
 * Stack layout for Inbox screens.
 */
export default function InboxLayout() {
  return (
    <Stack>
      {/* Inbox list */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Message detail */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Message",
          headerBackTitle: "Inbox",
        }}
      />

      {/* New message */}
      <Stack.Screen
        name="new"
        options={{
          headerShown: true,
          title: "New Message",
          headerBackTitle: "Inbox",
        }}
      />
    </Stack>
  );
}

