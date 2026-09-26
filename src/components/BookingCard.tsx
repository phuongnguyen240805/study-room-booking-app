import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { TIME_SLOTS } from '../constants/timeSlots';
import { formatDateVN } from '../utils/dateUtils';

interface BookingCardProps {
  booking: Booking;
  onShowQR: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  cancelling?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onShowQR,
  onCancel,
  cancelling = false,
}) => {
  const slot = TIME_SLOTS.find((s) => s.id === booking.slot_id);
  const isActive = booking.status === 'active';

  const confirmCancel = () => {
    Alert.alert(
      'Hủy đặt phòng',
      `Bạn có chắc chắn muốn hủy lịch đặt ${booking.room?.code || 'phòng'} vào ngày ${formatDateVN(
        booking.booking_date
      )} không?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt phòng',
          style: 'destructive',
          onPress: () => onCancel(booking.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.header}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomCode}>{booking.room?.code || 'Phòng học'}</Text>
          <Text style={styles.roomName} numberOfLines={1}>
            {booking.room?.name || ''}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isActive ? styles.statusActive : styles.statusCancelled,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isActive ? styles.textActive : styles.textCancelled,
            ]}
          >
            {isActive ? 'Đã xác nhận' : 'Đã hủy'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="calendar" size={16} color="#0284C7" />
          <Text style={styles.metaText}>{formatDateVN(booking.booking_date)}</Text>
        </View>

        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#0284C7" />
          <Text style={styles.metaText}>
            {slot ? `${slot.name} (${slot.start} - ${slot.end})` : booking.slot_id}
          </Text>
        </View>
      </View>

      {booking.room && (
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="office-building" size={15} color="#64748B" />
          <Text style={styles.locationText}>
            Tòa {booking.room.building} · Tầng {booking.room.floor}
          </Text>
        </View>
      )}

      {isActive && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => onShowQR(booking)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="qrcode" size={18} color="#0284C7" />
            <Text style={styles.qrBtnText}>Thẻ vé QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={confirmCancel}
            disabled={cancelling}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.cancelBtnText}>Hủy đặt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardInactive: {
    opacity: 0.65,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  roomName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusCancelled: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textActive: {
    color: '#047857',
  },
  textCancelled: {
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 6,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  qrBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 6,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 4,
  },
});
