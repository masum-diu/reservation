import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Booking, Room } from '../types';
import { Colors } from '../theme/colors';
import { fmt12 } from '../utils/time';

type Props = { bookings: Booking[]; rooms: Room[]; isAdmin?: boolean; onDelete?: (id: string) => Promise<void> | void };

type Section = { title: string; icon: string; color: string; data: Booking[] };

export default function BookingList({ bookings, rooms, isAdmin, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const getRoom = (id: string) => rooms.find(r => r.id === id);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const sort = (arr: Booking[]) =>
    [...arr].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const sections: Section[] = [
    {
      title: 'Today',
      icon: 'calendar-today',
      color: Colors.accent,
      data: sort(bookings.filter(b => b.date === today)),
    },
    {
      title: 'Upcoming',
      icon: 'calendar-clock',
      color: Colors.success,
      data: sort(bookings.filter(b => b.date > today)),
    },
  ].filter(s => s.data.length > 0);

  if (sections.length === 0) {
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

  const toggle = (title: string) =>
    setCollapsed(p => ({ ...p, [title]: !p[title] }));

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <TouchableOpacity
          style={[styles.sectionHeader, { borderLeftColor: section.color }]}
          onPress={() => toggle(section.title)}
          activeOpacity={0.7}>
          <View style={[styles.sectionIconBox, { backgroundColor: section.color + '18' }]}>
            <Icon name={section.icon} size={15} color={section.color} />
          </View>
          <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
          <View style={[styles.countBadge, { backgroundColor: section.color + '18' }]}>
            <Text style={[styles.countText, { color: section.color }]}>{section.data.length}</Text>
          </View>
          <Icon
            name={collapsed[section.title] ? 'chevron-down' : 'chevron-up'}
            size={18} color={section.color} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}
      renderItem={({ item, section }) => {
        if (collapsed[section.title]) return null;
        const room = getRoom(item.roomId);
        const color = room?.color ?? Colors.accent;
        const isPast = item.date < today || (item.date === today);
        return (
          <View style={[styles.card, isPast && item.date < today && styles.cardPast]}>
            <View style={[styles.accentBar, { backgroundColor: color }]} />
            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
                  <Icon name="door-open" size={18} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, item.date < today && styles.titlePast]}>{item.title}</Text>
                  <Text style={styles.roomName}>{room?.name}</Text>
                </View>
                {item.date > today && (
                  <View style={styles.advanceBadge}>
                    <Icon name="calendar-arrow-right" size={11} color={Colors.success} />
                    <Text style={styles.advanceText}>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                )}
                {isAdmin && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    disabled={deletingIds.has(item.id)}
                    onPress={() => {
                      Alert.alert(
                        'Delete Booking',
                        `Delete "${item.title}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              setDeletingIds(prev => new Set(prev).add(item.id));
                              try {
                                await onDelete?.(item.id);
                              } finally {
                                setDeletingIds(prev => {
                                  const next = new Set(prev);
                                  next.delete(item.id);
                                  return next;
                                });
                              }
                            },
                          },
                        ],
                      );
                    }}>
                    {deletingIds.has(item.id)
                      ? <ActivityIndicator size="small" color={Colors.error} />
                      : <Icon name="trash-can-outline" size={16} color={Colors.error} />}
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.metaRow}>
                <MetaItem icon="clock-outline" text={`${fmt12(item.startTime)} – ${fmt12(item.endTime)}`} color={color} />
                <MetaItem icon="account" text={item.organizer} color={color} />
              </View>
              <View style={styles.metaRow}>
                <MetaItem icon="map-marker" text={`Floor ${room?.floor}`} color={color} />
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
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bg,
    borderLeftWidth: 3, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 10, marginTop: 4,
  },
  sectionIconBox: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  countBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10,
  },
  countText: { fontSize: 12, fontWeight: '800' },
  card: {
    flexDirection: 'row', backgroundColor: Colors.card,
    borderRadius: 16, marginBottom: 10, overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardPast: { opacity: 0.6 },
  accentBar: { width: 4 },
  cardContent: { flex: 1, padding: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: Colors.text, fontSize: 14, fontWeight: '800' },
  titlePast: { color: Colors.textMuted },
  roomName: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
  advanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.success + '18',
    borderWidth: 1, borderColor: Colors.success + '44',
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  advanceText: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    padding: 6, borderRadius: 8,
    backgroundColor: Colors.error + '18',
    marginLeft: 6,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { color: Colors.textMuted, fontSize: 11 },
});
