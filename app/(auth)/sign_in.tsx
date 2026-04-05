import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignInScreen = () => {
    return (
        <View>
            <Text>Sign In</Text>
            <Link href="/(auth)/sign_up">
                Create Account
            </Link>
        </View>
    );
};

export default SignInScreen;