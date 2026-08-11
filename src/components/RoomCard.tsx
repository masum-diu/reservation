import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Room, Booking } from '../types';
import { Colors } from '../theme/colors';

type Props = {
  room: Room;
  bookings: Booking[];
  onBook: (room: Room) => void;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
};

export default function RoomCard({ room, bookings, onBook, isAdmin, onDelete }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.roomId === room.id && b.date === today);
  const upcomingBookings = bookings
    .filter(b => b.roomId === room.id && b.date > today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 2);
  const isAvailable = todayBookings.length === 0;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.card}>
      {/* Color Banner */}
      <View style={[styles.banner, { backgroundColor: room.color }]}>
        <View style={styles.bannerLeft}>
          <Icon name="door-open" size={22} color="#fff" />
          <Text style={styles.bannerName}>{room.name}</Text>
        </View>
        <View style={styles.bannerRight}>
          {isAdmin && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete?.(room.id)}>
              <Icon name="trash-can-outline" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={[styles.statusBadge, { backgroundColor: isAvailable ? '#fff' : '#ffffff44' }]}>
            <Icon name={isAvailable ? 'check-circle' : 'clock-alert'} size={11}
              color={isAvailable ? room.color : '#fff'} />
            <Text style={[styles.statusText, { color: isAvailable ? room.color : '#fff' }]}>
              {isAvailable ? 'Free' : `${todayBookings.length} booked`}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="stairs" size={14} color={Colors.textMuted} />
            <Text style={styles.infoText}>Floor {room.floor}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Icon name="account-group" size={14} color={Colors.textMuted} />
            <Text style={styles.infoText}>{room.capacity} seats</Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.amenities}>
          {room.amenities.map(a => (
            <View key={a} style={[styles.tag, { borderColor: room.color + '55' }]}>
              <Icon name="check-circle-outline" size={10} color={room.color} />
              <Text style={[styles.tagText, { color: room.color }]}>{a}</Text>
            </View>
          ))}
        </View>

        {/* Schedule */}
        {todayBookings.length > 0 && (
          <View style={styles.schedule}>
            <View style={styles.scheduleHeader}>
              <Icon name="calendar-today" size={12} color={Colors.textMuted} />
              <Text style={styles.scheduleTitle}>TODAY'S SCHEDULE</Text>
            </View>
            {todayBookings.map(b => (
              <View key={b.id} style={styles.scheduleItem}>
                <View style={[styles.timeBar, { backgroundColor: room.color }]} />
                <View style={[styles.timeBadge, { backgroundColor: room.color + '18' }]}>
                  <Text style={[styles.timeText, { color: room.color }]}>{b.startTime}–{b.endTime}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meetingTitle}>{b.title}</Text>
                  <Text style={styles.organizer}>{b.organizer}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity style={[styles.bookBtn, { backgroundColor: room.color }]} onPress={() => onBook(room)}>
          <Icon name="calendar-plus" size={15} color="#fff" />
          <Text style={styles.bookBtnText}>Schedule Room</Text>
        </TouchableOpacity>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <View style={styles.upcoming}>
            <View style={styles.scheduleHeader}>
              <Icon name="calendar-clock" size={12} color={Colors.warning} />
              <Text style={[styles.scheduleTitle, { color: Colors.warning }]}>UPCOMING</Text>
            </View>
            {upcomingBookings.map(b => (
              <View key={b.id} style={styles.upcomingItem}>
                <View style={[styles.upcomingDateBadge, { backgroundColor: Colors.warning + '18', borderColor: Colors.warning + '44' }]}>
                  <Text style={[styles.upcomingDate, { color: Colors.warning }]}>{formatDate(b.date)}</Text>
                </View>
                <View style={[styles.timeBadge, { backgroundColor: room.color + '18' }]}>
                  <Text style={[styles.timeText, { color: room.color }]}>{b.startTime}–{b.endTime}</Text>
                </View>
                <Text style={styles.meetingTitle} numberOfLines={1}>{b.title}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 18,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bannerName: { color: '#fff', fontSize: 16, fontWeight: '800', flexShrink: 1 },
  bannerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    padding: 4, borderRadius: 8,
    backgroundColor: '#ffffff33',
  },
  body: { padding: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { color: Colors.textMuted, fontSize: 13 },
  infoDivider: { width: 1, height: 14, backgroundColor: Colors.border, marginHorizontal: 12 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: Colors.bg,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  schedule: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: 12, marginBottom: 14,
  },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  scheduleTitle: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  timeBar: { width: 3, height: 36, borderRadius: 2 },
  timeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timeText: { fontSize: 11, fontWeight: '700' },
  meetingTitle: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  organizer: { color: Colors.textMuted, fontSize: 11 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 12,
  },
  upcoming: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: 12, marginTop: 10,
  },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  upcomingDateBadge: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  upcomingDate: { fontSize: 11, fontWeight: '700' },
  bookBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
