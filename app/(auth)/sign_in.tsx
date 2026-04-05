import { useSignIn } from "@clerk/expo";
import { AuthScreenLayout } from "@/components/AuthScreenLayout";
import { buildAuthFinalize } from "@/lib/auth-navigate";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;

type ClientErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  const onFinalize = useMemo(() => buildAuthFinalize(router), [router]);

  const validateForm = useCallback(() => {
    const email = emailAddress.trim();
    const next: ClientErrors = {};

    if (!EMAIL_RE.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (password.length < MIN_PASSWORD_LEN) {
      next.password = `Password must be at least ${MIN_PASSWORD_LEN} characters.`;
    }

    setClientErrors(next);
    return Object.keys(next).length === 0;
  }, [emailAddress, password]);

  const runFinalize = useCallback(async () => {
    await signIn.finalize({
      navigate: onFinalize,
    });
  }, [signIn, onFinalize]);

  const handleSubmit = async () => {
    setClientErrors({});
    if (!validateForm()) return;

    const email = emailAddress.trim();
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (error) {
      return;
    }

    if (signIn.status === "complete") {
      await runFinalize();
    } else if (signIn.status === "needs_second_factor") {
      setClientErrors({
        form:
          "Additional verification is required for your account. Contact support or use another method if available.",
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        const sent = await signIn.mfa.sendEmailCode();
        if (sent.error) {
          setClientErrors({ form: sent.error.message ?? "Could not send code." });
        }
      } else {
        setClientErrors({
          form: "Verify this device from your email to continue.",
        });
      }
    } else {
      setClientErrors({
        form: "Sign-in could not be completed. Check your credentials and try again.",
      });
    }
  };

  const handleVerifyTrust = async () => {
    setClientErrors({});
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) {
      return;
    }
    if (signIn.status === "complete") {
      await runFinalize();
    } else {
      setClientErrors({
        form: "Sign-in could not be completed. Try again or request a new code.",
      });
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <AuthScreenLayout
        title="Check your email"
        subtitle="We sent a code to verify this sign-in. Enter it below."
      >
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Verification code</Text>
              <TextInput
                className={clsx(
                  "auth-input",
                  errors.fields.code && "auth-input-error",
                )}
                value={code}
                placeholder="Enter the code"
                placeholderTextColor="rgba(0,0,0,0.45)"
                onChangeText={setCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoCapitalize="none"
                accessibilityLabel="Verification code"
              />
              {errors.fields.code ? (
                <Text className="auth-error">{errors.fields.code.message}</Text>
              ) : null}
            </View>
            {clientErrors.form ? (
              <Text className="auth-error">{clientErrors.form}</Text>
            ) : null}
            <Pressable
              className={clsx(
                "auth-button",
                (!code.trim() || fetchStatus === "fetching") &&
                  "auth-button-disabled",
              )}
              disabled={!code.trim() || fetchStatus === "fetching"}
              onPress={handleVerifyTrust}
            >
              <Text className="auth-button-text">Continue</Text>
            </Pressable>
            <Pressable
              className="auth-secondary-button"
              onPress={() => signIn.mfa.sendEmailCode()}
              disabled={fetchStatus === "fetching"}
            >
              <Text className="auth-secondary-button-text">Resend code</Text>
            </Pressable>
            <Pressable
              className="auth-secondary-button"
              onPress={() => {
                setCode("");
                void signIn.reset();
              }}
            >
              <Text className="auth-secondary-button-text">Start over</Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Sign in to continue managing your subscriptions."
    >
      <View className="auth-card">
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={clsx(
                "auth-input",
                (clientErrors.email || errors.fields.identifier) &&
                  "auth-input-error",
              )}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor="rgba(0,0,0,0.45)"
              onChangeText={(v) => {
                setEmailAddress(v);
                if (clientErrors.email) {
                  setClientErrors((e) => ({ ...e, email: undefined }));
                }
              }}
              accessibilityLabel="Email"
            />
            {clientErrors.email ? (
              <Text className="auth-error">{clientErrors.email}</Text>
            ) : null}
            {errors.fields.identifier ? (
              <Text className="auth-error">
                {errors.fields.identifier.message}
              </Text>
            ) : null}
          </View>

          <View className="auth-field">
            <Text className="auth-label">Password</Text>
            <TextInput
              className={clsx(
                "auth-input",
                (clientErrors.password || errors.fields.password) &&
                  "auth-input-error",
              )}
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              onChangeText={(v) => {
                setPassword(v);
                if (clientErrors.password) {
                  setClientErrors((e) => ({ ...e, password: undefined }));
                }
              }}
              accessibilityLabel="Password"
            />
            {clientErrors.password ? (
              <Text className="auth-error">{clientErrors.password}</Text>
            ) : null}
            {errors.fields.password ? (
              <Text className="auth-error">
                {errors.fields.password.message}
              </Text>
            ) : null}
          </View>

          {clientErrors.form ? (
            <Text className="auth-error">{clientErrors.form}</Text>
          ) : null}
          {errors.global?.length ? (
            <Text className="auth-error">
              {errors.global.map((g) => g.message ?? g.code).join(" ")}
            </Text>
          ) : null}

          <Pressable
            className={clsx(
              "auth-button",
              (!emailAddress.trim() ||
                !password ||
                fetchStatus === "fetching") &&
                "auth-button-disabled",
            )}
            disabled={
              !emailAddress.trim() || !password || fetchStatus === "fetching"
            }
            onPress={handleSubmit}
          >
            <Text className="auth-button-text">Sign in</Text>
          </Pressable>
        </View>
      </View>

      <View className="auth-link-row">
        <Text className="auth-link-copy">New to Recurly? </Text>
        <Link href="/(auth)/sign_up" asChild>
          <Pressable hitSlop={8}>
            <Text className="auth-link">Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
