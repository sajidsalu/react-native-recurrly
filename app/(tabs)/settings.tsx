import { useClerk, useUser } from "@clerk/expo";
import images from "@/constants/image";
import dayjs from "dayjs";
import { styled } from "nativewind";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSSafeAreaView);

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#081126" />
      </SafeAreaView>
    );
  }

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  const displayName =
    user?.fullName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    email ||
    "Your account";

  const avatarSource =
    user?.imageUrl && user.imageUrl.length > 0
      ? { uri: user.imageUrl }
      : images.avatar;

  const show = (value: string) => (value.length > 0 ? value : "—");

  const accountId = user?.id ?? "";
  const joinedAt =
    user?.createdAt != null ? dayjs(user.createdAt).format("MMM D, YYYY") : "";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-30"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="list-title mb-6">Settings</Text>

        <View className="mb-6 items-center">
          <Image
            source={avatarSource}
            className="size-28 rounded-full border-2 border-border bg-muted"
            accessibilityLabel="Profile photo"
          />
          <Text
            className="mt-4 text-center text-2xl font-sans-bold text-primary"
            numberOfLines={2}
          >
            {displayName}
          </Text>
          {email ? (
            <Text
              className="mt-1.5 text-center text-base font-sans-medium text-muted-foreground"
              numberOfLines={2}
            >
              {email}
            </Text>
          ) : null}
        </View>

        <View className="rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 text-lg font-sans-bold text-primary">
            Profile
          </Text>
          <View className="gap-5">
            <View className="sub-row">
              <Text className="sub-label">First name</Text>
              <Text
                className="sub-value text-right font-sans-semibold"
                numberOfLines={2}
              >
                {show(firstName)}
              </Text>
            </View>
            <View className="h-px w-full bg-border" />
            <View className="sub-row">
              <Text className="sub-label">Last name</Text>
              <Text
                className="sub-value text-right font-sans-semibold"
                numberOfLines={2}
              >
                {show(lastName)}
              </Text>
            </View>
            <View className="h-px w-full bg-border" />
            <View className="sub-row">
              <Text className="sub-label">Email</Text>
              <Text
                className="sub-value text-right font-sans-semibold"
                numberOfLines={3}
              >
                {show(email)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 text-lg font-sans-bold text-primary">
            Account
          </Text>
          <View className="gap-5">
            <View className="sub-row">
              <Text className="sub-label">Account ID</Text>
              <Text
                className="sub-value text-right font-sans-semibold"
                numberOfLines={2}
                selectable
              >
                {show(accountId)}
              </Text>
            </View>
            <View className="h-px w-full bg-border" />
            <View className="sub-row">
              <Text className="sub-label">Joined</Text>
              <Text
                className="sub-value text-right font-sans-semibold"
                numberOfLines={2}
              >
                {show(joinedAt)}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          className="auth-button mt-8"
          onPress={() => {
            void signOut();
          }}
        >
          <Text className="auth-button-text">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
