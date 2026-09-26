import type { Building } from '../constants/buildings';

export type Equipment = 'projector' | 'whiteboard' | 'high_spec_pc' | 'ac';

export type CapacityFilter = 'all' | '2-4' | '5-8' | '9-12' | '13-20';

export interface Room {
  id: string;
  code: string;
  name: string;
  building: Building;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  image_url: string | null;
  created_at: string;
}

export type RoomAvailabilityStatus = 'available' | 'occupied' | 'no_slot';
