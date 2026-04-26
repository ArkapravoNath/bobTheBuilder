import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { BuddyButton } from '../../src/components/BuddyButton';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Brand mark */}
        <View style={styles.logoArea}>
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>BUILD BUDDY</Text>
          </View>
          <Text style={styles.headline}>Design your home.{'\n'}Know the cost.</Text>
          <Text style={styles.sub}>
            From a single room to a full mansion — draw your floor plan and get a transparent,
            location-adjusted estimate in minutes.
          </Text>
        </View>

        {/* Feature cards */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.actions}>
          <BuddyButton
            label="Get Started"
            onPress={() => router.push('/(auth)/signup')}
            variant="primary"
            fullWidth
          />
          <View style={styles.spacer} />
          <BuddyButton
            label="I already have an account"
            onPress={() => router.push('/(auth)/signin')}
            variant="ghost"
            fullWidth
          />
        </View>

        <Text style={styles.footer}>India-only MVP · All estimates in ₹ INR</Text>
      </View>
    </SafeAreaView>
  );
}

const FEATURES = [
  { icon: '✏️', title: 'Draw your floor plan', desc: 'Drag rooms, add windows & doors, set finishes' },
  { icon: '₹', title: 'Get an instant estimate', desc: 'Live material rates + 40% labour + regional adjustment' },
  { icon: '📄', title: 'Export as PDF', desc: 'Share a branded cost breakdown with your architect' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFAF7' },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoArea: { alignItems: 'flex-start' },
  logoPill: {
    backgroundColor: '#2A2825',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 20,
  },
  logoText: {
    color: '#FBFAF7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headline: {
    fontSize: 40,
    fontWeight: '600',
    color: '#2A2825',
    lineHeight: 46,
    marginBottom: 14,
  },
  sub: {
    fontSize: 15,
    color: '#8A857C',
    lineHeight: 22,
  },
  features: { gap: 16 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: { fontSize: 24, width: 32, textAlign: 'center', marginTop: 2 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: '#2A2825', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#8A857C', lineHeight: 18 },
  actions: {},
  spacer: { height: 10 },
  footer: {
    fontSize: 12,
    color: '#C4C0BA',
    textAlign: 'center',
    marginTop: 8,
  },
});
