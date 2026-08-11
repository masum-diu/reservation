export type Room = {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  amenities: string[];
  color: string;
};

export type Booking = {
  id: string;
  roomId: string;
  title: string;
  organizer: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  attendees: number;
};
