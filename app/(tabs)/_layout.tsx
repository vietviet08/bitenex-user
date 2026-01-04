import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: isDark ? colors.neutral[400] : colors.neutral[500],
        tabBarStyle: {
          backgroundColor: isDark ? colors.neutral[900] : colors.neutral[0],
          borderTopColor: isDark ? colors.neutral[800] : colors.border.light,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? 'house.fill' : 'house'}
              color={color}
            />
          ),
        }}
      />

      {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? 'magnifyingglass.circle.fill' : 'magnifyingglass'}
              color={color}
            />
          ),
        }}
      />

      {/* Orders Tab - to be added */}
      {/* <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? 'doc.text.fill' : 'doc.text'}
              color={color}
            />
          ),
        }}
      /> */}

      {/* Account Tab - to be added */}
      {/* <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? 'person.fill' : 'person'}
              color={color}
            />
          ),
        }}
      /> */}
    </Tabs>
  );
}
