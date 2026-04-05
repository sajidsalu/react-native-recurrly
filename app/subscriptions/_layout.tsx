import { RequireAuth } from "@/lib/auth-gate";
import { Stack } from "expo-router";

export default function SubscriptionsLayout() {
  return (
    <RequireAuth>
      <Stack screenOptions={{ headerShown: false }} />
    </RequireAuth>
  );
}
