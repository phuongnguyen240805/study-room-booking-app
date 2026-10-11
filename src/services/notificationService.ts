import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../types/booking';
import { TIME_SLOTS } from '../constants/timeSlots';

const NOTIFICATION_MAP_KEY = 'VKU_BOOKING_NOTIFICATION_MAP';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Không thể cài đặt Notifications handler:', e);
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (err) {
      console.warn('Lỗi xin quyền notification:', err);
      return false;
    }
  },

  async scheduleBookingReminder(booking: Booking, roomCode: string): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Quyền thông báo chưa được cấp.');
        return null;
      }

      const slot = TIME_SLOTS.find((s) => s.id === booking.slot_id);
      if (!slot) return null;

      const [year, month, day] = booking.booking_date.split('-').map(Number);
      const [startHour, startMinute] = slot.start.split(':').map(Number);

      const slotStartTime = new Date(year, month - 1, day, startHour, startMinute, 0);
      const reminderTime = new Date(slotStartTime.getTime() - 15 * 60 * 1000);
      const now = new Date();

      if (reminderTime <= now) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nhắc nhở phòng học VKU 🔔',
          body: `Lịch đặt phòng ${roomCode} (${slot.start} - ${slot.end}) của bạn sẽ bắt đầu trong 15 phút nữa!`,
          data: { bookingId: booking.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });

      await this.saveNotificationMapping(booking.id, notificationId);
      return notificationId;
    } catch (err) {
      console.warn('Lỗi schedule notification:', err);
      return null;
    }
  },

  async cancelBookingReminder(bookingId: string): Promise<void> {
    try {
      const map = await this.getNotificationMap();
      const notificationId = map[bookingId];
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        delete map[bookingId];
        await AsyncStorage.setItem(NOTIFICATION_MAP_KEY, JSON.stringify(map));
      }
    } catch (err) {
      console.warn('Lỗi hủy reminder notification:', err);
    }
  },

  async getNotificationMap(): Promise<Record<string, string>> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_MAP_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async saveNotificationMapping(bookingId: string, notificationId: string): Promise<void> {
    try {
      const map = await this.getNotificationMap();
      map[bookingId] = notificationId;
      await AsyncStorage.setItem(NOTIFICATION_MAP_KEY, JSON.stringify(map));
    } catch (err) {
      console.warn('Lỗi lưu mapping notification:', err);
    }
  },
};
