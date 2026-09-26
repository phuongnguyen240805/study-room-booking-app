import { Room, Equipment } from '../types/room';
import { BUILDINGS, Building } from '../constants/buildings';

const ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
];

const ALL_EQUIPMENTS: Equipment[] = ['projector', 'whiteboard', 'high_spec_pc', 'ac'];

export function generateBenchmarkRooms(count = 400): Room[] {
  const rooms: Room[] = [];

  for (let i = 1; i <= count; i++) {
    const building: Building = BUILDINGS[i % BUILDINGS.length];
    const floor = (i % 5) + 1;
    const roomNum = String(i).padStart(3, '0');
    const code = `${building}${floor}${roomNum.slice(-2)}`;

    // Generate random equipments
    const equipmentCount = (i % 4) + 1;
    const equipment: Equipment[] = ALL_EQUIPMENTS.slice(0, equipmentCount);

    // Capacities: 4, 8, 12, 16, 20
    const capacities = [4, 6, 8, 10, 12, 16, 20];
    const capacity = capacities[i % capacities.length];

    rooms.push({
      id: `mock-room-${i}`,
      code: `${code}-${i}`,
      name: `Phòng Nghiên Cứu & Tự Học ${code}`,
      building,
      floor,
      capacity,
      equipment,
      image_url: ROOM_PHOTOS[i % ROOM_PHOTOS.length],
      created_at: new Date().toISOString(),
    });
  }

  return rooms;
}
