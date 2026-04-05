import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

function AuthLoading() {
  return (
    <View className="auth-screen items-center justify-center">
      <ActivityIndicator size="large" color="#081126" />
    </View>
  );
}

/** Auth routes: redirect signed-in users to app home. */
export function AuthStackGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoading />;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

/** Main app routes: redirect signed-out users to sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoading />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign_in" />;
  }

  return <>{children}</>;
}
