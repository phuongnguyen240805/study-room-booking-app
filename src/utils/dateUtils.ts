import { TIME_SLOTS, SlotId } from '../constants/timeSlots';

export interface DayOption {
  dateString: string; // YYYY-MM-DD
  dayOfWeek: string;  // T2, T3, T4, T5, T6, T7, CN
  dayOfMonth: string; // 24, 25...
  isToday: boolean;
}

const DAYS_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function getUpcoming7Days(startDate: Date = new Date()): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    days.push({
      dateString,
      dayOfWeek: i === 0 ? 'Hôm nay' : DAYS_VN[d.getDay()],
      dayOfMonth: day,
      isToday: i === 0,
    });
  }
  return days;
}

export function formatDateVN(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function isSlotInPast(slotId: SlotId, selectedDate: string, now: Date = new Date()): boolean {
  const slot = TIME_SLOTS.find((s) => s.id === slotId);
  if (!slot) return false;

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  if (selectedDate < todayString) {
    return true;
  }
  if (selectedDate > todayString) {
    return false;
  }

  const [startHour, startMinute] = slot.start.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotStartMinutes = startHour * 60 + startMinute;

  return currentMinutes >= slotStartMinutes;
}
