import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

type Props = { onDone: () => void };

export default function OnboardingScreen({ onDone }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Background circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Icon */}
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconBg}>
            <Icon name="office-building" size={56} color={Colors.accent} />
          </View>
          <View style={styles.iconBadge}>
            <Icon name="calendar-check" size={16} color="#fff" />
          </View>
        </Animated.View>

        {/* Text */}
        <Text style={styles.title}>MeetSpace</Text>
        <Text style={styles.subtitle}>Smart Room Booking</Text>
        <Text style={styles.desc}>
          Effortlessly schedule and manage your office meeting rooms — no conflicts, no hassle.
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <FeatureRow icon="clock-fast" text="Real-time availability" />
          <FeatureRow icon="shield-check" text="Conflict-free scheduling" />
          <FeatureRow icon="account-group" text="Team-friendly booking" />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.btn} onPress={onDone} activeOpacity={0.85}>
          <Text style={styles.btnText}>Get Started</Text>
          <Icon name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.hint}>No account needed · Free to use</Text>
      </Animated.View>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size={16} color={Colors.accent} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  circle: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: Colors.accent + '12',
  },
  circleTop: { width: width * 0.9, height: width * 0.9, top: -width * 0.35, right: -width * 0.2 },
  circleBottom: { width: width * 0.7, height: width * 0.7, bottom: -width * 0.2, left: -width * 0.15 },
  content: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 32,
  },
  iconWrapper: { marginBottom: 28, position: 'relative' },
  iconBg: {
    width: 110, height: 110, borderRadius: 32,
    backgroundColor: Colors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.accent + '33',
  },
  iconBadge: {
    position: 'absolute', bottom: -6, right: -6,
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bg,
  },
  title: {
    fontSize: 36, fontWeight: '900',
    color: Colors.text, letterSpacing: -1, marginBottom: 4,
  },
  subtitle: {
    fontSize: 16, fontWeight: '600',
    color: Colors.accent, marginBottom: 16, letterSpacing: 0.5,
  },
  desc: {
    fontSize: 14, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  features: { width: '100%', gap: 12, marginBottom: 36 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.accent,
    paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 18, width: '100%', justifyContent: 'center',
    elevation: 4, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  hint: { color: Colors.textMuted, fontSize: 12, marginTop: 16 },
});
