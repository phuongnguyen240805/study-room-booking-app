import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { Profile } from '../types/auth';
import { Room, CapacityFilter, Equipment } from '../types/room';
import { Booking, CreateBookingParams } from '../types/booking';
import { Building } from '../constants/buildings';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import { generateBenchmarkRooms } from '../utils/mockRooms';

const FILTER_STORAGE_KEY = 'VKU_ROOM_FILTERS_PREF';

interface FilterPreferences {
  searchQuery: string;
  selectedBuildings: Building[];
  capacityFilter: CapacityFilter;
  selectedEquipment: Equipment[];
}

interface BookingStoreState {
  session: Session | null;
  profile: Profile | null;
  authLoading: boolean;

  rooms: Room[];
  activeBookings: Booking[];
  userBookings: Booking[];

  searchQuery: string;
  selectedBuildings: Building[];
  capacityFilter: CapacityFilter;
  selectedEquipment: Equipment[];

  roomsLoading: boolean;
  bookingsLoading: boolean;
  bookingSubmitting: boolean;

  error: string | null;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthLoading: (loading: boolean) => void;

  loadRooms: () => Promise<void>;
  loadActiveBookings: () => Promise<void>;
  loadUserBookings: () => Promise<void>;

  setSearchQuery: (query: string) => void;
  toggleBuilding: (building: Building) => void;
  setCapacityFilter: (capacity: CapacityFilter) => void;
  toggleEquipment: (eq: Equipment) => void;
  resetFilters: () => void;
  loadSavedFilters: () => Promise<void>;

  createBooking: (params: CreateBookingParams) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;

  handleRealtimeBookingInsert: (booking: Booking) => void;
  handleRealtimeBookingUpdate: (booking: Booking) => void;

  loadBenchmarkRooms: (count?: number) => void;
  clearUserState: () => void;
  setError: (error: string | null) => void;
}

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  session: null,
  profile: null,
  authLoading: true,

  rooms: [],
  activeBookings: [],
  userBookings: [],

  searchQuery: '',
  selectedBuildings: [],
  capacityFilter: 'all',
  selectedEquipment: [],

  roomsLoading: false,
  bookingsLoading: false,
  bookingSubmitting: false,
  error: null,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setError: (error) => set({ error }),

  loadRooms: async () => {
    set({ roomsLoading: true, error: null });
    try {
      const rooms = await roomService.getRooms();
      if (rooms && rooms.length > 0) {
        set({ rooms, roomsLoading: false });
      } else {
        const sampleRooms = generateBenchmarkRooms(20);
        set({ rooms: sampleRooms, roomsLoading: false });
      }
    } catch (err: any) {
      console.warn('Lỗi tải rooms từ Supabase, nạp 20 phòng mẫu VKU:', err);
      const sampleRooms = generateBenchmarkRooms(20);
      set({ rooms: sampleRooms, roomsLoading: false });
    }
  },

  loadBenchmarkRooms: (count = 400) => {
    const benchmarkRooms = generateBenchmarkRooms(count);
    set({ rooms: benchmarkRooms, roomsLoading: false, error: null });
  },

  loadActiveBookings: async () => {
    try {
      const activeBookings = await bookingService.getActiveBookings();
      set({ activeBookings });
    } catch (err: any) {
      console.warn('Lỗi tải active bookings:', err);
    }
  },

  loadUserBookings: async () => {
    const session = get().session;
    if (!session?.user?.id) return;

    set({ bookingsLoading: true });
    try {
      const userBookings = await bookingService.getUserBookings(session.user.id);
      set({ userBookings, bookingsLoading: false });
    } catch (err: any) {
      set({ error: getFriendlyErrorMessage(err), bookingsLoading: false });
    }
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    saveCurrentFilters({ ...get(), searchQuery });
  },

  toggleBuilding: (building) => {
    const current = get().selectedBuildings;
    const exists = current.includes(building);
    const selectedBuildings = exists
      ? current.filter((b) => b !== building)
      : [...current, building];

    set({ selectedBuildings });
    saveCurrentFilters({ ...get(), selectedBuildings });
  },

  setCapacityFilter: (capacityFilter) => {
    set({ capacityFilter });
    saveCurrentFilters({ ...get(), capacityFilter });
  },

  toggleEquipment: (eq) => {
    const current = get().selectedEquipment;
    const exists = current.includes(eq);
    const selectedEquipment = exists
      ? current.filter((item) => item !== eq)
      : [...current, eq];

    set({ selectedEquipment });
    saveCurrentFilters({ ...get(), selectedEquipment });
  },

  resetFilters: () => {
    const cleared: FilterPreferences = {
      searchQuery: '',
      selectedBuildings: [],
      capacityFilter: 'all',
      selectedEquipment: [],
    };
    set(cleared);
    AsyncStorage.removeItem(FILTER_STORAGE_KEY).catch(console.warn);
  },

  loadSavedFilters: async () => {
    try {
      const saved = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        const parsed: FilterPreferences = JSON.parse(saved);
        set({
          searchQuery: parsed.searchQuery || '',
          selectedBuildings: parsed.selectedBuildings || [],
          capacityFilter: parsed.capacityFilter || 'all',
          selectedEquipment: parsed.selectedEquipment || [],
        });
      }
    } catch (err) {
      console.warn('Lỗi khôi phục filters:', err);
    }
  },

  createBooking: async (params) => {
    const session = get().session;
    if (!session?.user?.id) {
      throw new Error('Bạn cần đăng nhập để đặt phòng!');
    }

    set({ bookingSubmitting: true, error: null });
    try {
      let newBooking: Booking;
      const room = get().rooms.find((r) => r.id === params.roomId);

      if (session.user.id.startsWith('demo-')) {
        // Handle demo mode booking in-memory
        newBooking = {
          id: `demo-booking-${Date.now()}`,
          user_id: session.user.id,
          room_id: params.roomId,
          booking_date: params.bookingDate,
          slot_id: params.slotId,
          status: 'active',
          created_at: new Date().toISOString(),
          cancelled_at: null,
          room: room,
        };
      } else {
        newBooking = await bookingService.createBooking(params, session.user.id);
      }

      set((state) => ({
        activeBookings: [...state.activeBookings, newBooking],
        userBookings: [newBooking, ...state.userBookings],
        bookingSubmitting: false,
      }));

      const roomCode = room?.code || 'Phòng học';
      notificationService.scheduleBookingReminder(newBooking, roomCode).catch(console.warn);

      return newBooking;
    } catch (err: any) {
      set({ bookingSubmitting: false });
      const friendlyMsg = getFriendlyErrorMessage(err);
      set({ error: friendlyMsg });
      throw new Error(friendlyMsg);
    }
  },

  cancelBooking: async (bookingId) => {
    const session = get().session;
    if (!session?.user?.id) return;

    try {
      if (session.user.id.startsWith('demo-')) {
        set((state) => ({
          activeBookings: state.activeBookings.filter((b) => b.id !== bookingId),
          userBookings: state.userBookings.map((b) =>
            b.id === bookingId
              ? { ...b, status: 'cancelled' as const, cancelled_at: new Date().toISOString() }
              : b
          ),
        }));
        notificationService.cancelBookingReminder(bookingId).catch(console.warn);
        return;
      }

      const updated = await bookingService.cancelBooking(bookingId, session.user.id);

      set((state) => ({
        activeBookings: state.activeBookings.filter((b) => b.id !== bookingId),
        userBookings: state.userBookings.map((b) => (b.id === bookingId ? updated : b)),
      }));

      notificationService.cancelBookingReminder(bookingId).catch(console.warn);
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      set({ error: friendlyMsg });
      throw new Error(friendlyMsg);
    }
  },

  handleRealtimeBookingInsert: (booking) => {
    if (booking.status === 'active') {
      set((state) => {
        const exists = state.activeBookings.some((b) => b.id === booking.id);
        if (exists) return state;
        return { activeBookings: [...state.activeBookings, booking] };
      });
    }
  },

  handleRealtimeBookingUpdate: (booking) => {
    set((state) => {
      if (booking.status === 'cancelled') {
        return {
          activeBookings: state.activeBookings.filter((b) => b.id !== booking.id),
          userBookings: state.userBookings.map((b) => (b.id === booking.id ? booking : b)),
        };
      } else if (booking.status === 'active') {
        const exists = state.activeBookings.some((b) => b.id === booking.id);
        const newActive = exists
          ? state.activeBookings.map((b) => (b.id === booking.id ? booking : b))
          : [...state.activeBookings, booking];
        return {
          activeBookings: newActive,
          userBookings: state.userBookings.map((b) => (b.id === booking.id ? booking : b)),
        };
      }
      return state;
    });
  },

  clearUserState: () => {
    set({
      session: null,
      profile: null,
      userBookings: [],
      error: null,
    });
  },
}));

function saveCurrentFilters(state: FilterPreferences) {
  const prefs: FilterPreferences = {
    searchQuery: state.searchQuery,
    selectedBuildings: state.selectedBuildings,
    capacityFilter: state.capacityFilter,
    selectedEquipment: state.selectedEquipment,
  };
  AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(prefs)).catch(console.warn);
}
