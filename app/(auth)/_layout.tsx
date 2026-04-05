import { AuthStackGate } from "@/lib/auth-gate";
import { Stack } from "expo-router";

export default function AuthRoutesLayout() {
  return (
    <AuthStackGate>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthStackGate>
  );
}
