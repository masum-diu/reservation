import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Platform, useWindowDimensions, ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Room } from '../types';
import { Colors } from '../theme/colors';
import { hasConflict, addBooking } from '../data/rooms';
import { fmt12 } from '../utils/time';

type Props = {
  room: Room | null;
  visible: boolean;
  onClose: () => void;
  onBooked: () => void;
  bookings: import('../types').Booking[];
};

// generate 30-min slots from 08:00 to 20:00
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const fmt = (d: Date) => d.toISOString().split('T')[0];

export default function BookingModal({ room, visible, onClose, onBooked, bookings }: Props) {
  const { width } = useWindowDimensions();
  const COLS = 3;
  const GRID_PADDING = 24 * 2; // sheet padding
  const SLOT_GAP = 6;
  const slotWidth = (width - GRID_PADDING - SLOT_GAP * (COLS - 1)) / COLS;
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendees, setAttendees] = useState('2');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle(''); setOrganizer(''); setDate(new Date());
    setStartTime(''); setEndTime(''); setAttendees('2');
  };

  // map each slot to booking info if booked
  const bookedMap = useMemo(() => {
    if (!room) return new Map<string, string>();
    const dayBookings = bookings.filter(
      b => b.roomId === room.id && b.date === fmt(date),
    );
    const map = new Map<string, string>();
    TIME_SLOTS.forEach(slot => {
      const booking = dayBookings.find(b => slot >= b.startTime && slot < b.endTime);
      if (booking) map.set(slot, `${booking.title} (${booking.organizer})`);
    });
    return map;
  }, [room, date, bookings]);

  // slots before the current time are unavailable, but only for today
  const isPastSlot = (slot: string): boolean => {
    if (fmt(date) !== fmt(new Date())) return false;
    const now = new Date();
    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return slot < nowStr;
  };

  const handleSlotPress = (slot: string) => {
    if (bookedMap.has(slot) || isPastSlot(slot)) return;
    if (!startTime || endTime) {
      setStartTime(slot);
      setEndTime('');
      return;
    }
    if (slot <= startTime) {
      setStartTime(slot);
      setEndTime('');
      return;
    }
    // block if any booked slot is in range
    const between = TIME_SLOTS.slice(TIME_SLOTS.indexOf(startTime) + 1, TIME_SLOTS.indexOf(slot) + 1);
    const conflict = between.find(s => bookedMap.has(s) || isPastSlot(s));
    if (conflict) {
      Alert.alert('Conflict', bookedMap.has(conflict)
        ? `"${bookedMap.get(conflict)}" is booked within your selected range.`
        : 'Selected range includes a past time slot.');
      return;
    }
    setEndTime(slot);
  };

  const slotState = (slot: string): 'booked' | 'start' | 'end' | 'range' | 'free' => {
    if (bookedMap.has(slot) || isPastSlot(slot)) return 'booked';
    if (slot === startTime) return 'start';
    if (slot === endTime) return 'end';
    if (startTime && endTime && slot > startTime && slot < endTime) return 'range';
    return 'free';
  };

  const handleBook = async () => {
    if (!title || !organizer || !startTime || !endTime) {
      Alert.alert('Missing Info', 'Please fill all fields and select start & end time.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const conflict = await hasConflict(room!.id, fmt(date), startTime, endTime);
      if (conflict) {
        Alert.alert('⚠️ Conflict', `${room!.name} is already booked during this time.`);
        return;
      }
      await addBooking({
        roomId: room!.id,
        title, organizer,
        date: fmt(date),
        startTime, endTime,
        attendees: parseInt(attendees, 10) || 1,
      });
      reset();
      onBooked();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={styles.sheet}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }} style={styles.closeBtn}>
            <Icon name="close" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={[styles.handle, { backgroundColor: room.color }]} />
          <Text style={styles.heading}>Book {room.name}</Text>
          <View style={styles.subRow}>
            <Icon name="stairs" size={14} color={Colors.textMuted} />
            <Text style={styles.sub}>Floor {room.floor}</Text>
            <View style={styles.subDivider} />
            <Icon name="account-group" size={14} color={Colors.textMuted} />
            <Text style={styles.sub}>Max {room.capacity}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <Text style={styles.label}>Meeting Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle}
                placeholder="e.g. Sprint Planning" placeholderTextColor={Colors.textMuted} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Organizer</Text>
              <TextInput style={styles.input} value={organizer} onChangeText={setOrganizer}
                placeholder="Your name" placeholderTextColor={Colors.textMuted} />
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                <Icon name="calendar" size={18} color={Colors.accent} />
                <Text style={styles.pickerBtnText}>{fmt(date)}</Text>
                <Icon name="chevron-down" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, d) => {
                  setShowDatePicker(false);
                  if (d) { setDate(d); setStartTime(''); setEndTime(''); }
                }}
              />
            )}

            {/* Time Slots */}
            <View style={styles.slotHeader}>
              <Text style={styles.label}>Time Slots</Text>
              <View style={styles.legend}>
                <LegendDot color={Colors.success} label="Free" />
                <LegendDot color={room.color} label="Selected" />
                <LegendDot color="#E57373" label="Booked" />
              </View>
            </View>

            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map(slot => {
                const state = slotState(slot);
                const isBooked = state === 'booked';
                const isSelected = state === 'start' || state === 'end' || state === 'range';
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slot, getSlotStyle(state, room.color), { width: slotWidth }]}
                    onPress={() => handleSlotPress(slot)}
                    disabled={state === 'booked'}
                    activeOpacity={0.8}>
                    {isBooked
                      ? <Icon name="lock-outline" size={12} color="#E57373" />
                      : <Icon name="clock-outline" size={12} color={isSelected ? '#fff' : Colors.success} />}
                    <Text style={[styles.slotText, { color: isBooked ? '#E57373' : isSelected ? '#fff' : Colors.text }]}>
                      {fmt12(slot)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected range display */}
            {startTime ? (
              <View style={[styles.rangeBox, { borderColor: room.color }]}>
                <Icon name="clock-outline" size={16} color={room.color} />
                <Text style={[styles.rangeText, { color: room.color }]}>
                  {fmt12(startTime)} {endTime ? `→  ${fmt12(endTime)}` : '→  tap end time'}
                </Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Attendees</Text>
              <TextInput style={styles.input} value={attendees} onChangeText={setAttendees}
                placeholder="2" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: room.color }, submitting && styles.confirmBtnDisabled]}
              onPress={handleBook}
              disabled={submitting}>
              {submitting
                ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                : <Icon name="calendar-check" size={18} color="#fff" style={{ marginRight: 8 }} />}
              <Text style={styles.confirmText}>{submitting ? 'Booking…' : 'Confirm Booking'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
              <Icon name="close-circle-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color + '33', borderColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function getSlotStyle(state: string, color: string) {
  if (state === 'booked') return { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' };
  if (state === 'start' || state === 'end') return { backgroundColor: color, borderColor: color };
  if (state === 'range') return { backgroundColor: color + '99', borderColor: color };
  return { backgroundColor: Colors.success + '15', borderColor: Colors.success + '55' };
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, maxHeight: '92%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  closeBtn: {
    position: 'absolute', top: 16, right: 24,
    padding: 6, borderRadius: 20,
    backgroundColor: Colors.border,
    zIndex: 10,
  },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 6 },
  subDivider: { width: 1, height: 12, backgroundColor: Colors.border, marginHorizontal: 2 },
  sub: { color: Colors.textMuted, fontSize: 13 },
  field: { marginBottom: 14 },
  label: { color: Colors.textMuted, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.card, borderRadius: 10, padding: 12,
    color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border,
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  pickerBtnText: { flex: 1, color: Colors.text, fontSize: 15 },
  slotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  legend: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot: { width: 10, height: 10, borderRadius: 3, borderWidth: 1 },
  legendText: { color: Colors.textMuted, fontSize: 10 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  slot: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10,
    borderRadius: 10, borderWidth: 1,
  },
  slotText: { fontSize: 11, fontWeight: '600' },
  rangeBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 14,
  },
  rangeText: { fontSize: 15, fontWeight: '700' },
  confirmBtn: {
    borderRadius: 14, padding: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', marginTop: 4,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  cancelText: { color: Colors.textMuted, fontSize: 14 },
});
