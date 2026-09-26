import { supabase } from './supabase';
import { Room } from '../types/room';

export const roomService = {
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      throw new Error(`Không thể tải danh sách phòng: ${error.message}`);
    }

    return (data || []) as Room[];
  },
};
