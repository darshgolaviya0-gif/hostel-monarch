import type { Bed, BedStatus, Building, Room, RoomType } from '../types';
import { STUDENTS } from './students';

const EXTRA_NAMES = [
  'Harsh Vaidya', 'Parth Oza', 'Manan Thakkar', 'Devansh Kapadia', 'Arjun Soni',
  'Nikhil Chavda', 'Om Prajapati', 'Raghav Bhavsar', 'Mihir Gandhi', 'Yug Panchal',
  'Jeet Parekh', 'Kiran Solanki', 'Tanvi Mistry', 'Simran Vyas', 'Pooja Modi',
  'Neha Rawal', 'Divya Bhanderi', 'Priya Kothari', 'Meet Kansara', 'Darshan Raval',
];
let extraIdx = 0;
function nextExtraName() {
  const name = EXTRA_NAMES[extraIdx % EXTRA_NAMES.length];
  extraIdx += 1;
  return name;
}

function studentFor(building: string, floor: string, room: string, bedLabel: string) {
  return STUDENTS.find(
    (s) =>
      s.allocation &&
      s.allocation.building === building &&
      s.allocation.floor === floor &&
      s.allocation.room === room &&
      s.allocation.bed === bedLabel
  );
}

interface RoomSeed {
  roomNo: string;
  floor: string;
  building: string;
  type: RoomType;
  capacity: number;
  rent: number;
  amenities: string[];
  bedStatuses?: BedStatus[]; // override for unallocated beds
}

function buildRoom(seed: RoomSeed): Room {
  const beds: Bed[] = [];
  for (let i = 1; i <= seed.capacity; i += 1) {
    const bedLabel = `Bed ${i}`;
    const student = studentFor(seed.building, seed.floor, seed.roomNo, bedLabel);
    if (student) {
      beds.push({ id: `${seed.roomNo}-${i}`, label: bedLabel, status: 'Occupied', studentId: student.id, studentName: student.name });
    } else {
      const override = seed.bedStatuses?.[i - 1];
      if (override === 'Maintenance') {
        beds.push({ id: `${seed.roomNo}-${i}`, label: bedLabel, status: 'Maintenance' });
      } else if (override === 'Reserved') {
        beds.push({ id: `${seed.roomNo}-${i}`, label: bedLabel, status: 'Reserved', studentName: nextExtraName() });
      } else if (override === 'Occupied') {
        beds.push({ id: `${seed.roomNo}-${i}`, label: bedLabel, status: 'Occupied', studentName: nextExtraName() });
      } else {
        beds.push({ id: `${seed.roomNo}-${i}`, label: bedLabel, status: 'Available' });
      }
    }
  }
  return {
    id: seed.roomNo,
    roomNo: seed.roomNo,
    floor: seed.floor,
    building: seed.building,
    type: seed.type,
    capacity: seed.capacity,
    beds,
    amenities: seed.amenities,
    monthlyRent: seed.rent,
  };
}

const STD_AMENITIES = ['Wi-Fi', 'Attached Washroom', 'Study Table', 'Wardrobe'];
const PREMIUM_AMENITIES = ['Wi-Fi', 'Attached Washroom', 'Study Table', 'Wardrobe', 'AC', 'Geyser'];

const shivajiRooms: RoomSeed[] = [
  { roomNo: 'A-101', floor: '1st Floor', building: 'Shivaji Bhavan', type: 'Triple Sharing', capacity: 3, rent: 7500, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied', 'Available'] },
  { roomNo: 'A-102', floor: '1st Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied'] },
  { roomNo: 'A-103', floor: '1st Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Available', 'Available'] },
  { roomNo: 'A-104', floor: '1st Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Maintenance'] },
  { roomNo: 'A-201', floor: '2nd Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9500, amenities: PREMIUM_AMENITIES, bedStatuses: ['Occupied', 'Occupied'] },
  { roomNo: 'A-202', floor: '2nd Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9500, amenities: PREMIUM_AMENITIES, bedStatuses: ['Occupied', 'Reserved'] },
  { roomNo: 'A-203', floor: '2nd Floor', building: 'Shivaji Bhavan', type: 'Triple Sharing', capacity: 3, rent: 8000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied', 'Available'] },
  { roomNo: 'A-204', floor: '2nd Floor', building: 'Shivaji Bhavan', type: 'Quad Sharing' as RoomType, capacity: 4, rent: 6800, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied', 'Occupied', 'Available'] },
  { roomNo: 'A-301', floor: '3rd Floor', building: 'Shivaji Bhavan', type: 'Triple Sharing', capacity: 3, rent: 8000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied', 'Occupied'] },
  { roomNo: 'A-302', floor: '3rd Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Available', 'Available'] },
  { roomNo: 'A-303', floor: '3rd Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9500, amenities: PREMIUM_AMENITIES, bedStatuses: ['Occupied', 'Available'] },
  { roomNo: 'A-304', floor: '3rd Floor', building: 'Shivaji Bhavan', type: 'Double Sharing', capacity: 2, rent: 9500, amenities: PREMIUM_AMENITIES, bedStatuses: ['Maintenance', 'Available'] },
];

const rajwadaRooms: RoomSeed[] = [
  { roomNo: 'B-101', floor: '1st Floor', building: 'Rajwada Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Available'] },
  { roomNo: 'B-102', floor: '1st Floor', building: 'Rajwada Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied'] },
  { roomNo: 'B-103', floor: '1st Floor', building: 'Rajwada Bhavan', type: 'Triple Sharing', capacity: 3, rent: 7800, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Available', 'Available'] },
  { roomNo: 'B-104', floor: '1st Floor', building: 'Rajwada Bhavan', type: 'Double Sharing', capacity: 2, rent: 9500, amenities: PREMIUM_AMENITIES, bedStatuses: ['Occupied', 'Reserved'] },
  { roomNo: 'B-201', floor: '2nd Floor', building: 'Rajwada Bhavan', type: 'Double Sharing', capacity: 2, rent: 9500, amenities: PREMIUM_AMENITIES, bedStatuses: ['Occupied', 'Occupied'] },
  { roomNo: 'B-202', floor: '2nd Floor', building: 'Rajwada Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Available'] },
  { roomNo: 'B-203', floor: '2nd Floor', building: 'Rajwada Bhavan', type: 'Triple Sharing', capacity: 3, rent: 7800, amenities: STD_AMENITIES, bedStatuses: ['Occupied', 'Occupied', 'Maintenance'] },
  { roomNo: 'B-204', floor: '2nd Floor', building: 'Rajwada Bhavan', type: 'Double Sharing', capacity: 2, rent: 9000, amenities: STD_AMENITIES, bedStatuses: ['Available', 'Available'] },
];

const shivajiRoomObjs = shivajiRooms.map(buildRoom);
const rajwadaRoomObjs = rajwadaRooms.map(buildRoom);

function toFloors(building: string, rooms: Room[]) {
  const floorNames = Array.from(new Set(rooms.map((r) => r.floor)));
  return floorNames.map((name, idx) => ({
    id: `${building}-F${idx + 1}`,
    name,
    building,
    rooms: rooms.filter((r) => r.floor === name),
  }));
}

export const BUILDINGS: Building[] = [
  {
    id: 'BLDG-A',
    name: 'Shivaji Bhavan',
    code: 'A',
    description: "Boys' Hostel Block — 3 floors, premium & standard rooms with attached washrooms.",
    floors: toFloors('Shivaji Bhavan', shivajiRoomObjs),
    totalRooms: shivajiRoomObjs.length,
    totalBeds: shivajiRoomObjs.reduce((a, r) => a + r.capacity, 0),
  },
  {
    id: 'BLDG-B',
    name: 'Rajwada Bhavan',
    code: 'B',
    description: "Girls' Hostel Block — 2 floors, secure wing with CCTV-monitored common areas.",
    floors: toFloors('Rajwada Bhavan', rajwadaRoomObjs),
    totalRooms: rajwadaRoomObjs.length,
    totalBeds: rajwadaRoomObjs.reduce((a, r) => a + r.capacity, 0),
  },
];

export const ALL_ROOMS: Room[] = [...shivajiRoomObjs, ...rajwadaRoomObjs];
export const ALL_BEDS: Bed[] = ALL_ROOMS.flatMap((r) => r.beds);

export const occupancyStats = () => {
  const total = ALL_BEDS.length;
  const occupied = ALL_BEDS.filter((b) => b.status === 'Occupied').length;
  const available = ALL_BEDS.filter((b) => b.status === 'Available').length;
  const reserved = ALL_BEDS.filter((b) => b.status === 'Reserved').length;
  const maintenance = ALL_BEDS.filter((b) => b.status === 'Maintenance').length;
  return { total, occupied, available, reserved, maintenance, occupancyRate: Math.round((occupied / total) * 100) };
};
