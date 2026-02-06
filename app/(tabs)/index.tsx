import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { SearchBar } from '@/components/home/SearchBar';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { CategoryRail } from '@/components/home/CategoryRail';
import { PopularRestaurants } from '@/components/home/PopularRestaurants';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <HomeHeader />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        <SearchBar />
        <PromoCarousel />
        <CategoryRail />
        <PopularRestaurants />
      </ScrollView>
    </SafeAreaView>
  );
}
