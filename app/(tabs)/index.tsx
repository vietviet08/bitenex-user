/**
 * Home Screen
 * Main entry point showing featured restaurants, categories, and promotions
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, textStyles, borderRadius } from '@/theme';
import { useUser, useCartItemCount } from '@/store';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const user = useUser();
  const cartItemCount = useCartItemCount();

  const handleOpenCart = () => {
    router.push('/(modal)/cart');
  };

  const handleSearch = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <IconSymbol name="location.fill" size={20} color={colors.primary[500]} />
          <View style={styles.locationText}>
            <Text style={styles.deliveryLabel}>Deliver to</Text>
            <TouchableOpacity style={styles.addressButton}>
              <Text style={styles.addressText} numberOfLines={1}>
                {user ? 'Select address' : 'Set your location'}
              </Text>
              <IconSymbol name="chevron.down" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Button */}
        <TouchableOpacity style={styles.cartButton} onPress={handleOpenCart}>
          <IconSymbol name="cart.fill" size={24} color={colors.text.primary} />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={handleSearch}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.text.tertiary} />
        <Text style={styles.searchPlaceholder}>Search restaurants or dishes...</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Promotions Banner - Placeholder */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>🔥 Free Delivery</Text>
          <Text style={styles.promoSubtitle}>On your first 3 orders</Text>
        </View>

        {/* Categories - Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['🍔 Burgers', '🍕 Pizza', '🍜 Noodles', '🍣 Sushi', '🥗 Salads', '🧁 Desserts'].map(
              (category, index) => (
                <TouchableOpacity key={index} style={styles.categoryCard}>
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Featured Restaurants - Placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Restaurant cards will go here */}
          <View style={styles.restaurantPlaceholder}>
            <Text style={styles.placeholderText}>Restaurant cards coming soon</Text>
          </View>
        </View>

        {/* Near You - Placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.restaurantPlaceholder}>
            <Text style={styles.placeholderText}>Nearby restaurants coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  deliveryLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    ...textStyles.label,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  cartButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  searchPlaceholder: {
    ...textStyles.body,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  promoBanner: {
    backgroundColor: colors.primary[500],
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  promoTitle: {
    ...textStyles.h3,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  promoSubtitle: {
    ...textStyles.body,
    color: colors.primary[100],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...textStyles.label,
    color: colors.primary[500],
  },
  categoryCard: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.lg,
  },
  categoryText: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  restaurantPlaceholder: {
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.lg,
    padding: spacing['3xl'],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  placeholderText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
});
