import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { icons } from '@/constants/icons';

const TabIcon = ({ icon, color }: any) => {
  return (
    <View>
      <Image source={icon} style={{ tintColor: color }} />
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ color }) => (
              <TabIcon icon={icons.home} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="collections"
          options={{
            headerShown: false,
            title: "Collection",
            tabBarIcon: ({ color }) => (
              <TabIcon icon={icons.collection} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="edit/[id]"
          options={{
            headerShown: false
          }}
        />
    </Tabs>
  )
}

export default _layout