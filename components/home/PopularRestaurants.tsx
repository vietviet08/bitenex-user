import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { RestaurantCard, Restaurant } from './RestaurantCard';
import { colors } from '@/theme';

const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Burger Joint',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: '$1.49',
    promoText: '20% off',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Italian Delight',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    rating: 4.5,
    deliveryTime: '35-45 min',
    deliveryFee: '$2.99',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Sushi Master',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    rating: 4.9,
    deliveryTime: '40-50 min',
    deliveryFee: '$3.99',
    promoText: 'Free delivery',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    cuisine: ['Mexican', 'Tacos', 'Burritos'],
    rating: 4.3,
    deliveryTime: '20-30 min',
    deliveryFee: '$1.99',
    isFavorite: false,
  },
];

export function PopularRestaurants() {
  return (
    <View className="mt-5 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-neutral-900">
          Popular Restaurants
        </Text>
        <Pressable hitSlop={8}>
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.primary[500] }}
          >
            See all
          </Text>
        </Pressable>
      </View>

      {/* Restaurant list */}
      <View className="gap-4">
        {RESTAURANTS.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </View>
    </View>
  );
}
