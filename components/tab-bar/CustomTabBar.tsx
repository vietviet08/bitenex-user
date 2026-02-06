import { View, Text, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabConfig = {
  key: string;
  label: string;
  icon: string;
};

const TABS: TabConfig[] = [
  { key: 'index', label: 'Home', icon: 'home' },
  { key: 'explore', label: 'Explore', icon: 'explore' },
  { key: 'cart', label: 'Cart', icon: 'shopping-bag' },
  { key: 'orders', label: 'Orders', icon: 'receipt-long' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

function triggerHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white pb-6 pt-2"
      style={isDark ? { backgroundColor: colors.neutral[900], borderTopColor: colors.neutral[800] } : undefined}
    >
      <View className="flex-row items-center justify-around px-6 h-16">
        {state.routes.map((route, index) => {
          const tabConfig = TABS.find((t) => t.key === route.name);
          if (!tabConfig) return null;

          const isFocused = state.index === index;
          const isCart = route.name === 'cart';

          const onPress = () => {
            triggerHaptic();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCart) {
            return (
              <View key={route.key} className="items-center" style={{ marginTop: -24 }}>
                <Pressable
                  onPress={onPress}
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: colors.primary[500],
                    shadowColor: colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <IconSymbol name="shopping-bag" size={28} color="#FFFFFF" />
                </Pressable>
              </View>
            );
          }

          const tintColor = isFocused
            ? colors.primary[500]
            : isDark
              ? colors.neutral[500]
              : colors.neutral[400];

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center"
              style={{ gap: 4 }}
            >
              <IconSymbol name={tabConfig.icon as any} size={26} color={tintColor} />
              <Text
                className="text-[10px]"
                style={{
                  color: tintColor,
                  fontWeight: isFocused ? '700' : '500',
                }}
              >
                {tabConfig.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
