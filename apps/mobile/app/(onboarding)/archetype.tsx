import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Archetype } from '@bob/shared-schemas';
import { BuddyButton } from '../../src/components/BuddyButton';

interface ArchetypeOption {
  value: Archetype;
  label: string;
  icon: string;
  desc: string;
  range: string;
}

const OPTIONS: ArchetypeOption[] = [
  {
    value: 'single_room',
    label: 'Single Room',
    icon: '🚪',
    desc: 'Renovate or build a single room — bedroom, kitchen, bathroom, or any space.',
    range: '100 – 500 sqft',
  },
  {
    value: 'partial_home',
    label: 'Partial Home',
    icon: '🏠',
    desc: 'A wing, floor, or apartment — partial renovation or extension project.',
    range: '500 – 1500 sqft',
  },
  {
    value: 'full_house',
    label: 'Full House',
    icon: '🏡',
    desc: 'Complete construction or gut renovation of a single-family home.',
    range: '1500 – 4000 sqft',
  },
  {
    value: 'mansion',
    label: 'Mansion',
    icon: '🏰',
    desc: 'Large-scale luxury villa or multi-storey bungalow with premium finishes.',
    range: '4000 sqft +',
  },
];

export default function ArchetypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Archetype | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    // Persist to session state — the location screen will send the combined PATCH
    router.push({ pathname: '/(onboarding)/location', params: { archetype: selected } });
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progress}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.step}>Step 1 of 3</Text>
        </View>

        <Text style={styles.headline}>What are you building?</Text>
        <Text style={styles.sub}>Pick the archetype that best describes your project.</Text>

        {/* Cards */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cards}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.card, selected === opt.value && styles.cardSelected]}
              onPress={() => setSelected(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === opt.value }}
              accessibilityLabel={`${opt.label}: ${opt.desc}`}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardIcon}>{opt.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, selected === opt.value && styles.cardTitleSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.cardRange}>{opt.range}</Text>
                </View>
                <Text style={styles.cardDesc}>{opt.desc}</Text>
              </View>
              {selected === opt.value && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <BuddyButton
            label="Continue"
            onPress={handleContinue}
            variant="primary"
            fullWidth
            disabled={!selected}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFAF7' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progress: { flexDirection: 'row', gap: 6 },
  progressDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8E2D7',
  },
  progressActive: { backgroundColor: '#1E6FD9', width: 24 },
  step: { fontSize: 13, color: '#8A857C' },
  headline: { fontSize: 28, fontWeight: '700', color: '#2A2825', marginBottom: 6 },
  sub: { fontSize: 15, color: '#8A857C', marginBottom: 20, lineHeight: 22 },
  scroll: { flex: 1 },
  cards: { gap: 12, paddingBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E2D7',
    padding: 16,
    gap: 14,
  },
  cardSelected: {
    borderColor: '#1E6FD9',
    backgroundColor: '#F0F6FF',
    shadowColor: '#1E6FD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#2A2825' },
  cardTitleSelected: { color: '#1E6FD9' },
  cardRange: { fontSize: 12, color: '#A06A3A', fontWeight: '600' },
  cardDesc: { fontSize: 13, color: '#8A857C', lineHeight: 18 },
  checkmark: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#1E6FD9', justifyContent: 'center', alignItems: 'center',
  },
  checkmarkText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  footer: { paddingTop: 12 },
});
