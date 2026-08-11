import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Booking, Room } from '../types';
import { Colors } from '../theme/colors';

type Props = {
  bookings: Booking[];
  rooms: Room[];
};

export default function BookingList({ bookings, rooms }: Props) {
  const getRoom = (id: string) => rooms.find(r => r.id === id);

  const sorted = [...bookings].sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime),
  );

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconBox}>
          <Icon name="calendar-blank-outline" size={40} color={Colors.accent} />
        </View>
        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
        <Text style={styles.emptyText}>Book a room to see it here</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sorted}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        const room = getRoom(item.roomId);
        const color = room?.color ?? Colors.accent;
        return (
          <View style={styles.card}>
            {/* Left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: color }]} />

            <View style={styles.cardContent}>
              {/* Top row */}
              <View style={styles.topRow}>
                <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
                  <Icon name="door-open" size={18} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.roomName}>{room?.name}</Text>
                </View>
                <View style={[styles.floorBadge, { backgroundColor: color + '18', borderColor: color + '44' }]}>
                  <Text style={[styles.floorText, { color }]}>F{room?.floor}</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Meta row */}
              <View style={styles.metaRow}>
                <MetaItem icon="calendar" text={item.date} color={color} />
                <MetaItem icon="clock-outline" text={`${item.startTime} – ${item.endTime}`} color={color} />
              </View>
              <View style={styles.metaRow}>
                <MetaItem icon="account" text={item.organizer} color={color} />
                <MetaItem icon="account-multiple" text={`${item.attendees} attendees`} color={color} />
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

function MetaItem({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={13} color={color} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  accentBar: { width: 5 },
  cardContent: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  roomName: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  floorBadge: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  floorText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  metaText: { color: Colors.textMuted, fontSize: 12 },
});
