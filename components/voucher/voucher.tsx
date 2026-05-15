import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Voucher {
  id: number;
  code: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  value: number;
  minOrderValue: number;
  discount: number;
  expiryDate: string;
  description: string;
  isUsed: boolean;
}

const VoucherScreen = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    // TODO: Gọi API thực tế sau
    try {
      // Mock data
      const mockVouchers: Voucher[] = [
        {
          id: 1,
          code: "WELCOME50",
          type: "FIXED_AMOUNT",
          value: 50000,
          minOrderValue: 150000,
          discount: 50000,
          expiryDate: "2026-06-30",
          description: "Giảm 50k cho đơn từ 150k",
          isUsed: false,
        },
        {
          id: 2,
          code: "FREESHIP",
          type: "FREE_SHIPPING",
          value: 0,
          minOrderValue: 100000,
          discount: 0,
          expiryDate: "2026-05-25",
          description: "Miễn phí vận chuyển",
          isUsed: false,
        },
        {
          id: 3,
          code: "SALE20",
          type: "PERCENTAGE",
          value: 20,
          minOrderValue: 200000,
          discount: 20,
          expiryDate: "2026-06-15",
          description: "Giảm 20% tối đa 100k",
          isUsed: true,
        },
      ];
      setVouchers(mockVouchers);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVouchers().finally(() => setRefreshing(false));
  };

  const applyVoucher = (voucher: Voucher) => {
    if (voucher.isUsed) {
      Alert.alert("Thông báo", "Bạn đã sử dụng voucher này rồi");
      return;
    }
    Alert.alert(
      "Áp dụng Voucher",
      `Sử dụng voucher ${voucher.code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Áp dụng", onPress: () => Alert.alert("Thành công", `Đã áp dụng ${voucher.code}`) },
      ]
    );
  };

  const renderVoucher = ({ item }: { item: Voucher }) => (
    <TouchableOpacity 
      style={styles.voucherCard}
      onPress={() => applyVoucher(item)}
      disabled={item.isUsed}
    >
      <View style={styles.leftSection}>
        <Text style={styles.discountText}>
          {item.type === 'FIXED_AMOUNT' && `-${item.value.toLocaleString()}đ`}
          {item.type === 'PERCENTAGE' && `-${item.value}%`}
          {item.type === 'FREE_SHIPPING' && 'FREESHIP'}
        </Text>
        <Text style={styles.minOrder}>Đơn tối thiểu {item.minOrderValue.toLocaleString()}đ</Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.expiry}>HSD: {item.expiryDate}</Text>
        {item.isUsed && <Text style={styles.usedText}>Đã dùng</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voucher của bạn</Text>
      </View>

      <FlatList
        data={vouchers}
        renderItem={renderVoucher}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Bạn chưa có voucher nào</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  voucherCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: { flex: 1 },
  discountText: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c' },
  minOrder: { fontSize: 13, color: '#666', marginTop: 4 },
  rightSection: { alignItems: 'flex-end' },
  code: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  expiry: { fontSize: 12, color: '#999', marginTop: 4 },
  usedText: { color: '#95a5a6', fontSize: 12, marginTop: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});

export default VoucherScreen;