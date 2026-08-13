import { Room, Booking } from '../types';
import { apiRequest } from '../api/client';

type ApiBooking = {
  id: string;
  room_id: string;
  title: string;
  organizer: string;
  date: string;
  start_time: string;
  end_time: string;
  attendees: number;
};

const toBooking = (b: ApiBooking): Booking => ({
  id: b.id,
  roomId: b.room_id,
  title: b.title,
  organizer: b.organizer,
  date: b.date,
  startTime: b.start_time,
  endTime: b.end_time,
  attendees: b.attendees,
});

export const fetchRooms = (): Promise<Room[]> => apiRequest<Room[]>('/rooms');

export const fetchBookings = (filters?: { roomId?: string; date?: string }): Promise<Booking[]> => {
  const params = new URLSearchParams();
  if (filters?.roomId) params.set('room_id', filters.roomId);
  if (filters?.date) params.set('date', filters.date);
  const qs = params.toString();

  return apiRequest<ApiBooking[]>(`/bookings${qs ? `?${qs}` : ''}`).then(list => list.map(toBooking));
};

export const addBooking = (booking: Omit<Booking, 'id'>): Promise<Booking> =>
  apiRequest<ApiBooking>('/bookings', {
    method: 'POST',
    body: {
      room_id: booking.roomId,
      title: booking.title,
      organizer: booking.organizer,
      date: booking.date,
      start_time: booking.startTime,
      end_time: booking.endTime,
      attendees: booking.attendees,
    },
  }).then(toBooking);

export const deleteBooking = (id: string): Promise<void> =>
  apiRequest<void>(`/bookings/${id}`, { method: 'DELETE', admin: true });

export const hasConflict = (
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
): Promise<boolean> => {
  const params = new URLSearchParams({
    room_id: roomId,
    date,
    start_time: startTime,
    end_time: endTime,
  });

  return apiRequest<{ conflict: boolean }>(`/bookings/check-conflict?${params.toString()}`).then(
    r => r.conflict,
  );
};

export const addRoom = (room: Omit<Room, 'id'>): Promise<Room> =>
  apiRequest<Room>('/rooms', { method: 'POST', body: room, admin: true });

export const deleteRoom = (id: string): Promise<void> =>
  apiRequest<void>(`/rooms/${id}`, { method: 'DELETE', admin: true });
