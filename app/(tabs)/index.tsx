import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/image";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";
 
const StyledSafeAreaView = styled(RNSSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string|null>(null);

  return (
    <StyledSafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>

        <Image style={{ width: 24, height: 24 }} source={icons.add} className="home-add-icon"/>
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
          <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
        </View>

      </View>

      <View>
          <ListHeading title="Upcoming" />
          <FlatList 
            data={UPCOMING_SUBSCRIPTIONS}
            renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<Text className='home-empty-state'>No Upcoming Renewals</Text>}
          />
        </View>
      <View>
          <ListHeading title="All Subscriptions" />
          <FlatList
            data={HOME_SUBSCRIPTIONS}
            renderItem={({ item }) => (
              <SubscriptionCard {...item} 
                expanded={expandedSubscriptionId === item.id} 
                onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)}
              />)}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
          
          />

      </View>
     
    </StyledSafeAreaView>
  );
}