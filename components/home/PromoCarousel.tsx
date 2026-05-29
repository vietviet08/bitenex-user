import { View, Text, ScrollView, Dimensions } from 'react-native';
import React from 'react';
import { colors } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_GAP = 12;

type PromoItem = {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  bgColor: string;
};

const PROMOS: PromoItem[] = [
  {
    id: '1',
    badge: 'Flash Sale',
    badgeColor: colors.primary[500],
    title: '50% OFF',
    subtitle: 'On your first order above $20',
    bgColor: '#1E293B',
  },
  {
    id: '2',
    badge: 'Free Delivery',
    badgeColor: '#3B82F6',
    title: 'Free Delivery Week',
    subtitle: 'Platform wide until Sunday',
    bgColor: '#1E40AF',
  },
  {
    id: '3',
    badge: 'Limited Time',
    badgeColor: colors.primary[500],
    title: 'New Places',
    subtitle: 'Try something different today',
    bgColor: '#7C2D12',
  },
];

function PromoCard({ item }: { item: PromoItem }) {
  return (
    <View
      className="rounded-2xl overflow-hidden justify-end"
      style={{
        width: CARD_WIDTH,
        aspectRatio: 2,
        backgroundColor: item.bgColor,
      }}
    >
      {/* Gradient overlay simulation */}
      <View className="absolute inset-0 bg-black/20 rounded-2xl" />

      {/* Content */}
      <View className="p-5 z-10">
        <View
          className="self-start px-2.5 py-1 rounded-full mb-2"
          style={{ backgroundColor: item.badgeColor }}
        >
          <Text className="text-white text-xs font-semibold">{item.badge}</Text>
        </View>
        <Text className="text-white text-2xl font-bold">{item.title}</Text>
        <Text className="text-white/70 text-sm mt-1">{item.subtitle}</Text>
      </View>
    </View>
  );
}

export function PromoCarousel() {
  return (
    <View className="mt-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP }}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
      >
        {PROMOS.map((item) => (
          <PromoCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
