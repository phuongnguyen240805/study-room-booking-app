import { supabase } from './supabase';
import { Booking, CreateBookingParams } from '../types/booking';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const bookingService = {
  async getActiveBookings(startDate?: string, endDate?: string): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('status', 'active');

    if (startDate) {
      query = query.gte('booking_date', startDate);
    }
    if (endDate) {
      query = query.lte('booking_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Booking[];
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false })
      .order('slot_id', { ascending: true });

    if (error) throw error;
    return (data || []) as Booking[];
  },

  async createBooking(params: CreateBookingParams, userId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        room_id: params.roomId,
        booking_date: params.bookingDate,
        slot_id: params.slotId,
        status: 'active',
      })
      .select('*, room:rooms(*)')
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('*, room:rooms(*)')
      .single();

    if (error) throw error;
    return data as Booking;
  },

  subscribeToBookings(
    onInsert: (booking: Booking) => void,
    onUpdate: (booking: Booking) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          onInsert(payload.new as Booking);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          onUpdate(payload.new as Booking);
        }
      )
      .subscribe();

    return channel;
  },
};
