import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TimeSlot } from '../constants/timeSlots';

export type SlotState = 'available' | 'selected' | 'booked' | 'past';

interface TimeSlotCardProps {
  slot: TimeSlot;
  state: SlotState;
  onSelect: (slot: TimeSlot) => void;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  slot,
  state,
  onSelect,
}) => {
  const isAvailable = state === 'available';
  const isSelected = state === 'selected';
  const isBooked = state === 'booked';
  const isPast = state === 'past';
  const isDisabled = isBooked || isPast;

  const getBadge = () => {
    if (isSelected) {
      return (
        <View style={[styles.badge, styles.badgeSelected]}>
          <Text style={styles.badgeTextSelected}>Đang chọn</Text>
        </View>
      );
    }
    if (isBooked) {
      return (
        <View style={[styles.badge, styles.badgeBooked]}>
          <Text style={styles.badgeTextBooked}>Đã đặt</Text>
        </View>
      );
    }
    if (isPast) {
      return (
        <View style={[styles.badge, styles.badgePast]}>
          <Text style={styles.badgeTextPast}>Đã qua</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgeAvailable]}>
        <Text style={styles.badgeTextAvailable}>Còn trống</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isBooked && styles.cardBooked,
        isPast && styles.cardPast,
      ]}
      onPress={() => onSelect(slot)}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.slotName,
            isSelected && styles.slotNameSelected,
            isDisabled && styles.textDisabled,
          ]}
        >
          {slot.name}
        </Text>
        {getBadge()}
      </View>

      <View style={styles.timeRow}>
        <MaterialCommunityIcons
          name="clock-time-four-outline"
          size={16}
          color={isSelected ? '#E0F2FE' : isDisabled ? '#94A3B8' : '#0284C7'}
        />
        <Text
          style={[
            styles.timeText,
            isSelected && styles.timeTextSelected,
            isDisabled && styles.textDisabled,
          ]}
        >
          {slot.start} - {slot.end}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    width: '48%',
  },
  cardSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  cardBooked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  cardPast: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  slotNameSelected: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: '#64748B',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 6,
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  badgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeBooked: {
    backgroundColor: '#FEE2E2',
  },
  badgePast: {
    backgroundColor: '#E2E8F0',
  },
  badgeTextAvailable: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  badgeTextSelected: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeTextBooked: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
  },
  badgeTextPast: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
});
