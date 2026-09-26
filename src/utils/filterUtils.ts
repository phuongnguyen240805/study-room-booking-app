import { Room, CapacityFilter, Equipment } from '../types/room';
import { Building } from '../constants/buildings';

export function matchesCapacityFilter(capacity: number, filter: CapacityFilter): boolean {
  switch (filter) {
    case '2-4':
      return capacity >= 2 && capacity <= 4;
    case '5-8':
      return capacity >= 5 && capacity <= 8;
    case '9-12':
      return capacity >= 9 && capacity <= 12;
    case '13-20':
      return capacity >= 13 && capacity <= 20;
    case 'all':
    default:
      return true;
  }
}

export function filterRooms(
  rooms: Room[],
  query: string,
  selectedBuildings: Building[],
  capacityFilter: CapacityFilter,
  selectedEquipment: Equipment[]
): Room[] {
  const normalizedQuery = query.trim().toLowerCase();

  return rooms.filter((room) => {
    if (normalizedQuery.length > 0) {
      const matchCode = room.code.toLowerCase().includes(normalizedQuery);
      const matchName = room.name.toLowerCase().includes(normalizedQuery);
      if (!matchCode && !matchName) return false;
    }

    if (selectedBuildings.length > 0) {
      if (!selectedBuildings.includes(room.building)) return false;
    }

    if (!matchesCapacityFilter(room.capacity, capacityFilter)) {
      return false;
    }

    if (selectedEquipment.length > 0) {
      const hasAll = selectedEquipment.every((eq) => room.equipment.includes(eq));
      if (!hasAll) return false;
    }

    return true;
  });
}
