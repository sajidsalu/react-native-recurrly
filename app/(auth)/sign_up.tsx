import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUpScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();

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
    await signUp.finalize({
      navigate: onFinalize,
    });
  }, [signUp, onFinalize]);

  const handleSubmit = async () => {
    setClientErrors({});
    if (!validateForm()) return;

    const email = emailAddress.trim();
    const { error } = await signUp.password({
      emailAddress: email,
      password,
    });

    if (error) {
      return;
    }

    if (signUp.status === "complete") {
      await runFinalize();
      return;
    }

    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) {
      setClientErrors({
        form: sent.error.message ?? "Could not send verification email.",
      });
    }
  };

  const handleVerify = async () => {
    setClientErrors({});
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      return;
    }
    if (signUp.status === "complete") {
      await runFinalize();
    } else {
      setClientErrors({
        form: "Verification did not complete. Try again or request a new code.",
      });
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <AuthScreenLayout
        title="Verify your email"
        subtitle="Enter the code we sent to your inbox to finish creating your account."
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
                placeholder="Enter your verification code"
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
            {errors.global?.length ? (
              <Text className="auth-error">
                {errors.global.map((g) => g.message ?? g.code).join(" ")}
              </Text>
            ) : null}
            <Pressable
              className={clsx(
                "auth-button",
                (!code.trim() || fetchStatus === "fetching") &&
                  "auth-button-disabled",
              )}
              disabled={!code.trim() || fetchStatus === "fetching"}
              onPress={handleVerify}
            >
              <Text className="auth-button-text">Verify</Text>
            </Pressable>
            <Pressable
              className="auth-secondary-button"
              onPress={() => signUp.verifications.sendEmailCode()}
              disabled={fetchStatus === "fetching"}
            >
              <Text className="auth-secondary-button-text">
                I need a new code
              </Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Create your account"
      subtitle="Track renewals and stay on top of spending with confidence."
    >
      <View className="auth-card">
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={clsx(
                "auth-input",
                (clientErrors.email || errors.fields.emailAddress) &&
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
            {errors.fields.emailAddress ? (
              <Text className="auth-error">
                {errors.fields.emailAddress.message}
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
              placeholder="Create a password"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="password-new"
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
            <Text className="auth-helper">
              At least {MIN_PASSWORD_LEN} characters.
            </Text>
          </View>

          {clientErrors.form ? (
            <Text className="auth-error">{clientErrors.form}</Text>
          ) : null}
          {errors.fields.captcha ? (
            <Text className="auth-error">{errors.fields.captcha.message}</Text>
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
            <Text className="auth-button-text">Sign up</Text>
          </Pressable>

          <View nativeID="clerk-captcha" />
        </View>
      </View>

      <View className="auth-link-row">
        <Text className="auth-link-copy">Already have an account? </Text>
        <Link href="/(auth)/sign_in" asChild>
          <Pressable hitSlop={8}>
            <Text className="auth-link">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
