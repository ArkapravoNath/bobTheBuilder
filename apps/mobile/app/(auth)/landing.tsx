import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BuddyButton } from '../../src/components/BuddyButton';
import { useAuth } from '../../src/auth/AuthContext';
import { C } from '../../src/theme/colors';

const FEATURES = [
  { icon: '✏️', title: 'Draw your floor plan', desc: 'Drag rooms, doors, windows and finishes in 2D' },
  { icon: '₹',  title: 'Live cost estimate',   desc: 'Material rates + 40% labour + regional multiplier' },
  { icon: '📄', title: 'Export as PDF',         desc: 'Share a branded breakdown with your architect' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { devLogin } = useAuth();
  const [devLoading, setDevLoading] = useState(false);

  async function handleDevLogin() {
    setDevLoading(true);
    try {
      await devLogin();
      router.replace('/');
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Brand */}
        <View style={styles.brand}>
          <Image
            source={require('../../assets/brand/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>BUILD BUDDY</Text>
          <Text style={styles.tagline}>Design your home. Know the cost.</Text>
          <Text style={styles.sub}>
            From a single room to a full mansion — draw your floor plan and get a
            transparent, location-adjusted estimate in minutes.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}><Text style={styles.featureIconText}>{f.icon}</Text></View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.actions}>
          <BuddyButton label="Get Started" onPress={() => router.push('/(auth)/signup')} variant="primary" fullWidth uppercase />
          <View style={{ height: 12 }} />
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')} style={styles.signinLink} accessibilityRole="link">
            <Text style={styles.signinText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>India-only MVP · All estimates in ₹ INR</Text>

        {/* Dev bypass — only in __DEV__ builds */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.devBtn, devLoading && { opacity: 0.5 }]}
            onPress={handleDevLogin}
            disabled={devLoading}
            accessibilityRole="button"
          >
            <Text style={styles.devBtnText}>
              {devLoading ? 'Loading…' : '⚡ Dev Login — skip to Designs'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 32, justifyContent: 'space-between' },
  brand: { alignItems: 'center' },
  logo: { width: 80, height: 80, borderRadius: 18, marginBottom: 16 },
  brandName: { fontSize: 11, fontWeight: '700', letterSpacing: 3, color: C.muted, marginBottom: 12 },
  tagline: { fontSize: 32, fontWeight: '700', color: C.ink, textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  sub: { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22 },
  features: { gap: 18 },
  featureRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: C.teakLight, justifyContent: 'center', alignItems: 'center' },
  featureIconText: { fontSize: 18 },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 2 },
  featureDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  actions: {},
  signinLink: { alignItems: 'center', padding: 8 },
  signinText: { fontSize: 14, color: C.teak, fontWeight: '600' },
  footer: { fontSize: 12, color: C.placeholder, textAlign: 'center' },
  devBtn: {
    marginTop: 16, paddingVertical: 12, alignItems: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: '#A06A3A',
    backgroundColor: '#1C1917',
  },
  devBtnText: { fontSize: 13, color: '#A06A3A', fontWeight: '700' },
});
