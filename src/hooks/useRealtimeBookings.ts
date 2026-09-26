import { useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { useBookingStore } from '../stores/useBookingStore';

export function useRealtimeBookings() {
  const session = useBookingStore((s) => s.session);
  const handleRealtimeBookingInsert = useBookingStore((s) => s.handleRealtimeBookingInsert);
  const handleRealtimeBookingUpdate = useBookingStore((s) => s.handleRealtimeBookingUpdate);
  const loadActiveBookings = useBookingStore((s) => s.loadActiveBookings);

  useEffect(() => {
    if (!session) return;

    loadActiveBookings();

    const channel = bookingService.subscribeToBookings(
      (newBooking) => {
        handleRealtimeBookingInsert(newBooking);
      },
      (updatedBooking) => {
        handleRealtimeBookingUpdate(updatedBooking);
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [session]);
}
