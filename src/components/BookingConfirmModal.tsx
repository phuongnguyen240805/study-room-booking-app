import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Room } from '../types/room';
import { TimeSlot } from '../constants/timeSlots';
import { formatDateVN } from '../utils/dateUtils';

interface BookingConfirmModalProps {
  visible: boolean;
  room: Room;
  date: string;
  slot: TimeSlot | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  visible,
  room,
  date,
  slot,
  loading,
  onConfirm,
  onCancel,
}) => {
  if (!slot) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="calendar-check" size={28} color="#0284C7" />
            </View>
            <Text style={styles.title}>Xác nhận đặt phòng</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Phòng:</Text>
              <Text style={styles.value}>{room.code} - {room.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Vị trí:</Text>
              <Text style={styles.value}>Tòa {room.building} · Tầng {room.floor}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Ngày đặt:</Text>
              <Text style={styles.value}>{formatDateVN(date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Ca học:</Text>
              <Text style={[styles.value, { color: '#0284C7', fontWeight: '700' }]}>
                {slot.name} ({slot.start} - {slot.end})
              </Text>
            </View>

            <View style={styles.noteBox}>
              <MaterialCommunityIcons name="bell-ring-outline" size={16} color="#0369A1" />
              <Text style={styles.noteText}>
                Hệ thống sẽ tự động nhắc nhở bạn trước giờ bắt đầu 15 phút.
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Quay lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, loading && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmText}>Xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  details: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  noteText: {
    fontSize: 12,
    color: '#0369A1',
    marginLeft: 8,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#0284C7',
    marginLeft: 8,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
