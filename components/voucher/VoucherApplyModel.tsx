import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface VoucherApplyModalProps {
  visible: boolean;
  onClose: () => void;
  onApplySuccess?: (result: any) => void;
}

const VoucherApplyModal: React.FC<VoucherApplyModalProps> = ({
  visible,
  onClose,
  onApplySuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // TODO: Gọi API thật sau
      // const response = await api.post('/vouchers/apply', { code, order_subtotal: orderAmount });

      // Mock response
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockResult = {
        success: true,
        voucher_code: code.toUpperCase(),
        discount_amount: 50000,
        final_amount: 450000,
        message: 'Áp dụng voucher thành công!',
      };

      setResult(mockResult);

      if (onApplySuccess) {
        onApplySuccess(mockResult);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Voucher không hợp lệ hoặc đã hết hạn',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCode('');
    setResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nhập mã Voucher</Text>
            <TouchableOpacity onPress={resetModal}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã voucher (ví dụ: WELCOME50)"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={20}
            />
          </View>

          {/* Result */}
          {result && (
            <View style={[
              styles.resultContainer,
              { backgroundColor: result.success ? '#e8f5e9' : '#ffebee' }
            ]}>
              <Text style={[
                styles.resultText,
                { color: result.success ? '#2e7d32' : '#c62828' }
              ]}>
                {result.message}
              </Text>
              {result.success && (
                <Text style={styles.discountText}>
                  Giảm {result.discount_amount.toLocaleString()}đ
                </Text>
              )}
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[styles.applyButton, loading && styles.buttonDisabled]}
            onPress={handleApply}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>ÁP DỤNG</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={resetModal}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  resultContainer: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  discountText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
    color: '#e74c3c',
  },
  applyButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#f5b7b1',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default VoucherApplyModal;