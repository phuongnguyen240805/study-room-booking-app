export type SlotId = 'S1' | 'S2' | 'S3' | 'S4';

export interface TimeSlot {
  id: SlotId;
  name: string;
  start: string;
  end: string;
}

export const TIME_SLOTS: readonly TimeSlot[] = [
  {
    id: 'S1',
    name: 'Slot 1',
    start: '07:30',
    end: '09:30',
  },
  {
    id: 'S2',
    name: 'Slot 2',
    start: '09:30',
    end: '11:30',
  },
  {
    id: 'S3',
    name: 'Slot 3',
    start: '13:00',
    end: '15:00',
  },
  {
    id: 'S4',
    name: 'Slot 4',
    start: '15:00',
    end: '17:00',
  },
] as const;
