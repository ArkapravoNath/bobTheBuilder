/**
 * Landing screen story.
 * Renders the same visual as app/(auth)/landing.tsx but replaces useRouter calls
 * with action() stubs so the story works without a navigation context.
 */
import React from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '../action';
import { BuddyButton } from '../../components/BuddyButton';
import { C } from '../../theme/colors';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

// ── Presentational component (mirrors landing.tsx without router) ─────────────

const FEATURES = [
  { icon: '✏️', title: 'Draw your floor plan',  desc: 'Drag rooms, doors, windows and finishes in 2D' },
  { icon: '₹',  title: 'Live cost estimate',    desc: 'Material rates + 40% labour + regional multiplier' },
  { icon: '📄', title: 'Export as PDF',          desc: 'Share a branded breakdown with your architect' },
];

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

function LandingView({ onGetStarted, onSignIn }: LandingProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand */}
      <View style={styles.brand}>
        <Image
          source={require('../../../assets/brand/logo.jpeg')}
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
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>{f.icon}</Text>
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <BuddyButton label="Get Started" onPress={onGetStarted} variant="primary" fullWidth uppercase />
        <View style={{ height: 12 }} />
        <TouchableOpacity onPress={onSignIn} style={styles.signinLink} accessibilityRole="link">
          <Text style={styles.signinText}>I already have an account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>India-only MVP · All estimates in ₹ INR</Text>
    </ScrollView>
  );
}

// ── Story metadata ─────────────────────────────────────────────────────────────

const meta = {
  title: 'Screens/Landing',
  component: LandingView,
  decorators: [withStoryWrapper({ bg: 'cream', padding: 0, fill: true })],
  args: {
    onGetStarted: action('get-started'),
    onSignIn:     action('sign-in'),
  },
} satisfies Meta<typeof LandingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ── Styles (matches landing.tsx) ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 28,
    paddingTop: 48,
    backgroundColor: C.bg,
  },
  brand: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 16 },
  brandName: {
    fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: { fontSize: 15, color: C.secondary, textAlign: 'center', marginBottom: 8 },
  sub: {
    fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20,
  },
  features: { marginBottom: 32 },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.teakLight, justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: { fontSize: 18 },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 2 },
  featureDesc:  { fontSize: 13, color: C.muted, lineHeight: 18 },
  actions: { marginTop: 8 },
  signinLink: { alignItems: 'center', paddingVertical: 8 },
  signinText: { fontSize: 14, color: C.teak, fontWeight: '600' },
  footer: {
    textAlign: 'center', fontSize: 11, color: C.placeholder, marginTop: 24,
  },
});
