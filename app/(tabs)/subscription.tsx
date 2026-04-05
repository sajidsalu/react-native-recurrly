import { styled } from "nativewind";
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";
 
const SafeAreaView = styled(RNSSafeAreaView);

const Subscription = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>Subscription</Text>
    </SafeAreaView>
  )
}

export default Subscription;