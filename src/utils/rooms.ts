import type { Building, Room } from '../types';

const BUILDING_META: Record<string, { code: string; description: string }> = {
  'Shivaji Bhavan': { code: 'A', description: "Boys' Hostel Block — 3 floors, premium & standard rooms with attached washrooms." },
  'Rajwada Bhavan': { code: 'B', description: "Girls' Hostel Block — 2 floors, secure wing with CCTV-monitored common areas." },
};

export function groupIntoBuildings(rooms: Room[]): Building[] {
  const buildingNames = Array.from(new Set(rooms.map((r) => r.building)));
  return buildingNames.map((name) => {
    const buildingRooms = rooms.filter((r) => r.building === name);
    const floorNames = Array.from(new Set(buildingRooms.map((r) => r.floor)));
    const meta = BUILDING_META[name] ?? { code: name[0], description: '' };
    return {
      id: `BLDG-${meta.code}`,
      name,
      code: meta.code,
      description: meta.description,
      totalRooms: buildingRooms.length,
      totalBeds: buildingRooms.reduce((a, r) => a + r.capacity, 0),
      floors: floorNames.map((fname, idx) => ({
        id: `${name}-F${idx + 1}`,
        name: fname,
        building: name,
        rooms: buildingRooms.filter((r) => r.floor === fname),
      })),
    };
  });
}

export function roomOccupancy(room: Room) {
  const occupied = room.beds.filter((b) => b.status === 'Occupied').length;
  const available = room.beds.filter((b) => b.status === 'Available').length;
  return { occupied, available, capacity: room.capacity };
}
