import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { icons } from '@/constants/icons';

const TabIcon = ({ icon, color, focused }: any) => {
  return (
    <View className="items-center justify-center">
      <Image 
        source={icon} 
        style={{ tintColor: color, width: 24, height: 24 }} 
        resizeMode="contain"
      />
      {focused && (
        <View className="w-1 h-1 bg-purple-500 rounded-full mt-1" />
      )}
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#a855f7', // purple-500
        tabBarInactiveTintColor: '#6b7280', // gray-500
        tabBarStyle: {
          backgroundColor: '#0f172a', // gray-950
          borderTopColor: '#1e293b', // gray-800
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="collections"
          options={{
            headerShown: false,
            title: "Collections",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.collection} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="edit/[id]"
          options={{
            headerShown: false,
            href: null, // Hide from tab bar
          }}
        />
    </Tabs>
  )
}

export default _layout