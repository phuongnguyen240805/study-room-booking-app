import type { SlotId } from '../constants/timeSlots';
import type { Room } from './room';

export type BookingStatus = 'active' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  booking_date: string; // YYYY-MM-DD
  slot_id: SlotId;
  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
  room?: Room;
}

export interface CreateBookingParams {
  roomId: string;
  bookingDate: string;
  slotId: SlotId;
}
