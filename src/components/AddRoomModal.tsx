import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../theme/colors';
import { addRoom } from '../data/rooms';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
};

const COLORS = ['#6C63FF', '#FF6584', '#FFB800', '#43D9AD', '#FF8C42', '#4ECDC4'];

export default function AddRoomModal({ visible, onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [floor, setFloor] = useState('');
  const [amenities, setAmenities] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const reset = () => {
    setName(''); setCapacity(''); setFloor(''); setAmenities(''); setColor(COLORS[0]);
  };

  const handleAdd = () => {
    if (!name || !capacity || !floor) {
      Alert.alert('Missing Info', 'Please fill name, capacity and floor.');
      return;
    }
    addRoom({
      id: 'r_' + Date.now(),
      name,
      capacity: parseInt(capacity, 10) || 1,
      floor: parseInt(floor, 10) || 1,
      amenities: amenities.split(',').map(a => a.trim()).filter(Boolean),
      color,
    });
    reset();
    onAdded();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={[styles.handle, { backgroundColor: Colors.accent }]} />
          <Text style={styles.heading}>Add New Room</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Field label="Room Name" value={name} onChange={setName} placeholder="e.g. Board Room" />
            <Field label="Capacity" value={capacity} onChange={setCapacity} placeholder="10" keyboardType="numeric" />
            <Field label="Floor" value={floor} onChange={setFloor} placeholder="3" keyboardType="numeric" />
            <Field label="Amenities (comma separated)" value={amenities} onChange={setAmenities} placeholder="Projector, Whiteboard" />

            <Text style={styles.label}>Room Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                  onPress={() => setColor(c)}
                >
                  {color === c && <Icon name="check" size={14} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: Colors.accent }]} onPress={handleAdd}>
              <Icon name="plus-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.confirmText}>Add Room</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
              <Icon name="close-circle-outline" size={16} color={Colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  heading: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { color: Colors.textMuted, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  colorDotSelected: { borderWidth: 2, borderColor: Colors.text },
  confirmBtn: {
    borderRadius: 14, padding: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 4,
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  cancelText: { color: Colors.textMuted, fontSize: 14 },
});
