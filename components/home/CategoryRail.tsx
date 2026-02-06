import { View, Text, ScrollView, Pressable } from 'react-native';
import React, { memo } from 'react';
import { colors } from '@/theme';

export type Category = {
  id: string;
  name: string;
  icon: string;
};

const CATEGORIES: Category[] = [
  { id: '1', name: 'Offers', icon: '🏷️' },
  { id: '2', name: 'Burger', icon: '🍔' },
  { id: '3', name: 'Pizza', icon: '🍕' },
  { id: '4', name: 'Asian', icon: '🍜' },
  { id: '5', name: 'Dessert', icon: '🍦' },
  { id: '6', name: 'Coffee', icon: '☕' },
  { id: '7', name: 'Healthy', icon: '🥗' },
  { id: '8', name: 'Sushi', icon: '🍣' },
];

const CategoryTile = memo(function CategoryTile({ item }: { item: Category }) {
  return (
    <Pressable className="items-center">
      <View className="w-[72px] h-[72px] items-center justify-center bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <Text className="text-2xl">{item.icon}</Text>
      </View>
      <Text className="text-xs font-medium text-neutral-700 mt-2 text-center">
        {item.name}
      </Text>
    </Pressable>
  );
});

export function CategoryRail() {
  return (
    <View className="mt-5">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text className="text-lg font-bold text-neutral-900">Categories</Text>
        <Pressable hitSlop={8}>
          <Text style={{ color: colors.primary[500] }} className="text-sm font-semibold">
            See all
          </Text>
        </Pressable>
      </View>

      {/* Tiles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryTile key={cat.id} item={cat} />
        ))}
      </ScrollView>
    </View>
  );
}
