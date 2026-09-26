import { useMemo } from 'react';
import { useBookingStore } from '../stores/useBookingStore';
import { getRoomCurrentStatus } from '../utils/bookingUtils';
import { RoomAvailabilityStatus } from '../types/room';

export function useRoomAvailability(roomId: string): RoomAvailabilityStatus {
  const activeBookings = useBookingStore((s) => s.activeBookings);

  return useMemo(() => {
    return getRoomCurrentStatus(roomId, activeBookings);
  }, [roomId, activeBookings]);
}
