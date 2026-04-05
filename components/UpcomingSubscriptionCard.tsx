import { formatCurrency } from '@/lib/utils'
import React from 'react'
import { Image, Text, View } from 'react-native'

const UpcomingSubscriptionCard = ({ name, price, daysLeft, icon, currency}: UpcomingSubscriptionCardProps) => {
  return (
    <View className='upcoming-card'>
        <View className='upcoming-row'>
            <Image source={icon} className='upcoming-icon' style={{ width: 32, height: 32 }} />
            <View className='upcoming-price'>
                <Text className='upcoming-price'>{formatCurrency(price, currency || "USD")}</Text>
                <Text className='upcoming-meta' numberOfLines={1}>{daysLeft > 1 ? `${daysLeft} days` : `${daysLeft} day`} left</Text>
            </View>
        </View>
        <Text className='upcoming-name' numberOfLines={1}>{name}</Text>
    </View>
  )
}

export default UpcomingSubscriptionCard