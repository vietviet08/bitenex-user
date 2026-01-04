import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, textStyles } from '@/theme';
import { useCartStore, useCartItems } from '@/store';
import { formatCurrency } from '@/utils';

export default function CartScreen() {
  const items = useCartItems();
  const { getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    // TODO: Navigate to checkout flow
    console.log('[Cart] Proceeding to checkout');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from a restaurant to get started
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.back()}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.options.length > 0 && (
                  <Text style={styles.itemOptions}>
                    {item.options.map((o) => o.name).join(', ')}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(getSubtotal())}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(getDeliveryFee())}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
            </View>
          </View>
        )}
      />

      {/* Checkout Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>
            Checkout • {formatCurrency(getTotal())}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  itemQuantity: {
    ...textStyles.label,
    color: colors.primary[500],
    marginRight: spacing.sm,
    minWidth: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  itemOptions: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  itemPrice: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  summary: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  totalValue: {
    ...textStyles.h4,
    color: colors.primary[500],
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  checkoutButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  browseButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
  },
  browseButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
});
