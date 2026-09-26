import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TIME_SLOTS, TimeSlot, SlotId } from '../constants/timeSlots';
import { TimeSlotCard, SlotState } from './TimeSlotCard';
import { isSlotInPast } from '../utils/dateUtils';
import { Booking } from '../types/booking';

interface TimeSlotGridProps {
  roomId: string;
  selectedDate: string;
  selectedSlotId: SlotId | null;
  activeBookings: Booking[];
  onSelectSlot: (slot: TimeSlot) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  roomId,
  selectedDate,
  selectedSlotId,
  activeBookings,
  onSelectSlot,
}) => {
  const getSlotState = (slot: TimeSlot): SlotState => {
    // 1. Is it selected?
    if (selectedSlotId === slot.id) {
      return 'selected';
    }

    // 2. Is it in the past?
    if (isSlotInPast(slot.id, selectedDate)) {
      return 'past';
    }

    // 3. Is it booked for this room and date?
    const isBooked = activeBookings.some(
      (b) =>
        b.room_id === roomId &&
        b.booking_date === selectedDate &&
        b.slot_id === slot.id &&
        b.status === 'active'
    );

    if (isBooked) {
      return 'booked';
    }

    return 'available';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn ca học (2 tiếng / ca)</Text>
      <View style={styles.grid}>
        {TIME_SLOTS.map((slot) => (
          <TimeSlotCard
            key={slot.id}
            slot={slot}
            state={getSlotState(slot)}
            onSelect={onSelectSlot}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
