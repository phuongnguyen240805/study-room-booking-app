import { TIME_SLOTS, SlotId } from '../constants/timeSlots';
import { Booking } from '../types/booking';
import { RoomAvailabilityStatus } from '../types/room';

export function getCurrentSlot(now: Date = new Date()): SlotId | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const slot of TIME_SLOTS) {
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (currentMinutes >= startTotal && currentMinutes < endTotal) {
      return slot.id;
    }
  }
  return null;
}

export function getRoomCurrentStatus(
  roomId: string,
  bookings: Booking[],
  now: Date = new Date()
): RoomAvailabilityStatus {
  const currentSlot = getCurrentSlot(now);
  if (!currentSlot) {
    return 'no_slot';
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const isOccupied = bookings.some(
    (b) =>
      b.room_id === roomId &&
      b.booking_date === todayString &&
      b.slot_id === currentSlot &&
      b.status === 'active'
  );

  return isOccupied ? 'occupied' : 'available';
}

export function generateQrPayload(bookingId: string): string {
  return `vku-study-room://booking/${bookingId}`;
}
