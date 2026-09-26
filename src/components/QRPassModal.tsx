import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { TIME_SLOTS } from '../constants/timeSlots';
import { formatDateVN } from '../utils/dateUtils';
import { generateQrPayload } from '../utils/bookingUtils';

interface QRPassModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({
  visible,
  booking,
  onClose,
}) => {
  if (!booking) return null;

  const slot = TIME_SLOTS.find((s) => s.id === booking.slot_id);
  const qrPayload = generateQrPayload(booking.id);
  const shortRef = booking.id.substring(0, 8).toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badgeTop}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#047857" />
            <Text style={styles.badgeTopText}>VKU Study Pass Hợp Lệ</Text>
          </View>

          <Text style={styles.title}>Thẻ Đặt Chỗ Phòng Học</Text>
          <Text style={styles.subTitle}>Xuất trình mã QR tại phòng để điểm danh</Text>

          <View style={styles.qrContainer}>
            <QRCode
              value={qrPayload}
              size={180}
              color="#0F172A"
              backgroundColor="#FFFFFF"
            />
          </View>

          <Text style={styles.refText}>Mã vé: #{shortRef}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phòng:</Text>
              <Text style={styles.value}>
                {booking.room ? `${booking.room.code} - ${booking.room.name}` : 'Phòng học VKU'}
              </Text>
            </View>

            {booking.room && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vị trí:</Text>
                <Text style={styles.value}>
                  Tòa {booking.room.building} · Tầng {booking.room.floor}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày:</Text>
              <Text style={styles.value}>{formatDateVN(booking.booking_date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Thời gian:</Text>
              <Text style={[styles.value, { color: '#0284C7', fontWeight: '700' }]}>
                {slot ? `${slot.name} (${slot.start} - ${slot.end})` : booking.slot_id}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  badgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeTopText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  refText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  closeBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
