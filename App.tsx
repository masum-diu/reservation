import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fetchRooms, fetchBookings, deleteRoom } from './src/data/rooms';
import { setAdminPassword, clearAdminPassword } from './src/api/adminAuth';
import { ApiError } from './src/api/client';
import { Room, Booking } from './src/types';
import { Colors } from './src/theme/colors';
import RoomCard from './src/components/RoomCard';
import BookingModal from './src/components/BookingModal';
import BookingList from './src/components/BookingList';
import AddRoomModal from './src/components/AddRoomModal';
import OnboardingScreen from './src/components/OnboardingScreen';

type Tab = 'rooms' | 'bookings';

export default function App() {
  const [tab, setTab] = useState<Tab>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 403) {
      setIsAdmin(false);
      clearAdminPassword();
      Alert.alert('Access Denied', 'Incorrect admin password.');
      return;
    }
    Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong.');
  }, []);

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      clearAdminPassword();
      return;
    }
    setAdminPass('');
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    if (!adminPass) return;
    // No dedicated login endpoint — the password is only verified against
    // the server the first time an admin action (add/delete) is attempted.
    setAdminPassword(adminPass);
    setIsAdmin(true);
    setShowAdminLogin(false);
    setAdminPass('');
  };

  const refresh = useCallback(async () => {
    try {
      const [freshRooms, freshBookings] = await Promise.all([fetchRooms(), fetchBookings()]);
      setRooms(freshRooms);
      setBookings(freshBookings);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id);
      await refresh();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (!onboarded) return <OnboardingScreen onDone={() => setOnboarded(true)} />;

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.safe, styles.loadingScreen]}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* <Icon name="office-building" size={28} color={Colors.accent} /> */}
            <View >
              <Text style={styles.headerTitle}>MeetSpace</Text>
              <Text style={styles.headerSub}>Office Meeting Rooms</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.adminBtn, isAdmin && styles.adminBtnActive]}
            onPress={handleAdminToggle}>
            <Icon name={isAdmin ? 'shield-check' : 'shield-outline'} size={16} color={isAdmin ? '#fff' : Colors.textMuted} />
            <Text style={[styles.adminBtnText, isAdmin && { color: '#fff' }]}>
              {isAdmin ? 'Admin' : 'Admin'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TabBtn icon="floor-plan" label="Rooms" active={tab === 'rooms'} onPress={() => setTab('rooms')} />
          <TabBtn
            icon="calendar-check"
            label={`Bookings (${bookings.length})`}
            active={tab === 'bookings'}
            onPress={() => setTab('bookings')}
          />
        </View>

        {/* Content */}
        {tab === 'rooms' ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>SELECT A ROOM TO BOOK</Text>
              {isAdmin && (
                <TouchableOpacity style={styles.addRoomBtn} onPress={() => setShowAddRoom(true)}>
                  <Icon name="plus" size={14} color="#fff" />
                  <Text style={styles.addRoomText}>Add Room</Text>
                </TouchableOpacity>
              )}
            </View>
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                bookings={bookings}
                onBook={r => setSelectedRoom(r)}
                isAdmin={isAdmin}
                onDelete={id => { handleDeleteRoom(id); }}
              />
            ))}
          </ScrollView>
        ) : (
          <BookingList bookings={bookings} rooms={rooms} />
        )}

        {/* Booking Modal */}
        <BookingModal
          room={selectedRoom}
          visible={!!selectedRoom}
          bookings={bookings}
          onClose={() => setSelectedRoom(null)}
          onBooked={() => { refresh(); setSelectedRoom(null); }}
        />

        {/* Admin Login Modal */}
        <Modal visible={showAdminLogin} transparent animationType="fade">
          <View style={styles.loginOverlay}>
            <View style={styles.loginBox}>
              <Icon name="shield-lock" size={32} color={Colors.accent} style={{ marginBottom: 12 }} />
              <Text style={styles.loginTitle}>Admin Access</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.loginInput}
                  placeholder="Enter admin password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                  value={adminPass}
                  onChangeText={setAdminPass}
                  onSubmitEditing={handleAdminLogin}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                  <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.loginBtn} onPress={handleAdminLogin}>
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAdminLogin(false)}>
                <Text style={styles.loginCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Room Modal */}
        <AddRoomModal
          visible={showAddRoom}
          onClose={() => setShowAddRoom(false)}
          onAdded={() => { setShowAddRoom(false); refresh(); }}
          onError={handleApiError}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function TabBtn({
  icon, label, active, onPress,
}: {
  icon: string; label: string; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}>
      <Icon name={icon} size={16} color={active ? '#fff' : Colors.textMuted} style={{ marginRight: 5 }} />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingScreen: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSub: { color: Colors.textMuted, fontSize: 13 },
  roomCount: {
    backgroundColor: Colors.accent + '22',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  roomCountNum: { color: Colors.accent, fontSize: 22, fontWeight: '900' },
  roomCountLabel: { color: Colors.accent, fontSize: 10, letterSpacing: 1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'center' },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  content: { padding: 16 },
  adminBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  adminBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  adminBtnText: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, letterSpacing: 1.5 },
  addRoomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accent, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  addRoomText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  loginOverlay: {
    flex: 1, backgroundColor: '#000000BB',
    justifyContent: 'center', alignItems: 'center',
  },
  loginBox: {
    backgroundColor: Colors.surface,
    borderRadius: 20, padding: 28,
    width: '80%', alignItems: 'center',
  },
  loginTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  loginInput: {
    flex: 1, backgroundColor: Colors.card,
    borderRadius: 10, padding: 12,
    color: Colors.text, fontSize: 15,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  eyeBtn: { padding: 12 },
  loginBtn: {
    width: '100%', backgroundColor: Colors.accent,
    borderRadius: 10, padding: 13, alignItems: 'center', marginBottom: 8,
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  loginCancel: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
});
