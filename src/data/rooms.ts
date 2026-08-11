import { Room, Booking } from '../types';

export let ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Webable Large Conference Room',
    capacity: 10,
    floor: 4,
    amenities: ['Projector', 'Whiteboard', 'Video Call'],
    color: '#6C63FF',
  },
  {
    id: 'r2',
    name: 'Webable Small Conference Room',
    capacity: 6,
    floor: 4,
    amenities: ['TV Screen', 'Whiteboard'],
    color: '#FF6584',
  },
];

let bookings: Booking[] = [
  {
    id: 'b1',
    roomId: 'r1',
    title: 'Product Sync',
    organizer: 'Rahim',
    date: '2025-07-15',
    startTime: '10:00',
    endTime: '11:00',
    attendees: 5,
  },
  {
    id: 'b2',
    roomId: 'r2',
    title: 'Design Review',
    organizer: 'Karim',
    date: '2025-07-15',
    startTime: '14:00',
    endTime: '15:30',
    attendees: 4,
  },
];

export const getBookings = () => [...bookings];

export const addBooking = (booking: Booking) => {
  bookings = [...bookings, booking];
};

export const deleteBooking = (id: string) => {
  bookings = bookings.filter(b => b.id !== id);
};

export const hasConflict = (
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
): boolean => {
  return bookings
    .filter(b => b.roomId === roomId && b.date === date && b.id !== excludeId)
    .some(b => startTime < b.endTime && endTime > b.startTime);
};

export const addRoom = (room: Room) => {
  ROOMS.push(room);
};

export const deleteRoom = (id: string) => {
  const idx = ROOMS.findIndex(r => r.id === id);
  if (idx !== -1) ROOMS.splice(idx, 1);
  bookings = bookings.filter(b => b.roomId !== id);
};
