import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';

const INDIAN_CITIES = [
  { city: 'Mumbai',          tier: 'tier1', multiplier: 1.25 },
  { city: 'Delhi',           tier: 'tier1', multiplier: 1.18 },
  { city: 'Bengaluru',       tier: 'tier1', multiplier: 1.22 },
  { city: 'Hyderabad',       tier: 'tier1', multiplier: 1.15 },
  { city: 'Chennai',         tier: 'tier1', multiplier: 1.12 },
  { city: 'Kolkata',         tier: 'tier1', multiplier: 1.08 },
  { city: 'Pune',            tier: 'tier2', multiplier: 1.10 },
  { city: 'Ahmedabad',       tier: 'tier2', multiplier: 1.05 },
  { city: 'Jaipur',          tier: 'tier2', multiplier: 1.02 },
  { city: 'Lucknow',         tier: 'tier2', multiplier: 1.00 },
  { city: 'Kanpur',          tier: 'tier2', multiplier: 0.98 },
  { city: 'Nagpur',          tier: 'tier2', multiplier: 0.97 },
  { city: 'Indore',          tier: 'tier2', multiplier: 0.96 },
  { city: 'Thane',           tier: 'tier2', multiplier: 1.20 },
  { city: 'Bhopal',          tier: 'tier3', multiplier: 0.94 },
  { city: 'Visakhapatnam',   tier: 'tier3', multiplier: 0.95 },
  { city: 'Patna',           tier: 'tier3', multiplier: 0.90 },
  { city: 'Vadodara',        tier: 'tier3', multiplier: 0.95 },
  { city: 'Ghaziabad',       tier: 'tier2', multiplier: 1.10 },
  { city: 'Ludhiana',        tier: 'tier3', multiplier: 0.92 },
];

const TIER_LABELS: Record<string, string> = {
  tier1: 'Tier 1 Metro',
  tier2: 'Tier 2 City',
  tier3: 'Tier 3 City',
};

export default function LocationScreen() {
  const router = useRouter();
  const { archetype } = useLocalSearchParams<{ archetype: string }>();
  const { token, refreshUser } = useAuth();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    if (!query) return INDIAN_CITIES;
    return INDIAN_CITIES.filter((c) =>
      c.city.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';
      const res = await fetch(`${API_BASE}/v1/me/onboarding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          archetype: archetype ?? 'full_house',
          location: { city: selected },
        }),
      });
      if (!res.ok) throw new Error('Failed to save location');
      await refreshUser();
      router.push({ pathname: '/(onboarding)/details', params: { archetype, city: selected } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View style={styles.progress}>
            <View style={[styles.progressDot, styles.progressDone]} />
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.step}>Step 2 of 3</Text>
        </View>

        <Text style={styles.headline}>Where are you building?</Text>
        <Text style={styles.sub}>
          Regional costs vary significantly across India. We'll apply the right multiplier.
        </Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search cities…"
            placeholderTextColor="#C4C0BA"
            accessibilityLabel="Search cities"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* City list */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.city}
              style={[styles.cityRow, selected === item.city && styles.cityRowSelected]}
              onPress={() => setSelected(item.city)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === item.city }}
              accessibilityLabel={`${item.city}, ${TIER_LABELS[item.tier]}, ${item.multiplier}× multiplier`}
            >
              <View style={styles.cityLeft}>
                <Text style={styles.cityPin}>📍</Text>
              </View>
              <View style={styles.cityBody}>
                <Text style={[styles.cityName, selected === item.city && styles.cityNameSelected]}>
                  {item.city}
                </Text>
                <Text style={styles.cityTier}>{TIER_LABELS[item.tier]}</Text>
              </View>
              <View style={styles.cityRight}>
                <Text style={styles.multiplier}>{item.multiplier}×</Text>
                {selected === item.city && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text style={styles.noResults}>No cities matching "{query}"</Text>
          )}
        </ScrollView>

        {!!error && <Text style={styles.errorBanner}>{error}</Text>}

        <View style={styles.footer}>
          {selected ? (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>📍 {selected}</Text>
            </View>
          ) : null}
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
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backChevron: { fontSize: 28, color: '#2A2825', lineHeight: 32 },
  progress: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8E2D7' },
  progressDone: { backgroundColor: '#1E6FD9' },
  progressActive: { backgroundColor: '#1E6FD9', width: 24 },
  step: { fontSize: 13, color: '#8A857C' },
  headline: { fontSize: 26, fontWeight: '700', color: '#2A2825', marginBottom: 6 },
  sub: { fontSize: 14, color: '#8A857C', lineHeight: 20, marginBottom: 18 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E8E2D7', paddingHorizontal: 14, height: 48, marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#2A2825' },
  clearBtn: { fontSize: 16, color: '#8A857C', paddingLeft: 8 },
  list: { flex: 1 },
  cityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 6,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E2D7',
  },
  cityRowSelected: {
    borderColor: '#1E6FD9', backgroundColor: '#F0F6FF',
  },
  cityLeft: { marginRight: 12 },
  cityPin: { fontSize: 18 },
  cityBody: { flex: 1 },
  cityName: { fontSize: 15, fontWeight: '600', color: '#2A2825' },
  cityNameSelected: { color: '#1E6FD9' },
  cityTier: { fontSize: 12, color: '#8A857C', marginTop: 2 },
  cityRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  multiplier: { fontSize: 13, color: '#A06A3A', fontWeight: '700' },
  checkmark: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#1E6FD9', justifyContent: 'center', alignItems: 'center',
  },
  checkmarkText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  noResults: { textAlign: 'center', color: '#8A857C', fontSize: 14, paddingTop: 24 },
  errorBanner: {
    backgroundColor: '#FDF0EE', borderRadius: 8, padding: 12,
    fontSize: 13, color: '#E74C3C', marginBottom: 12,
  },
  footer: { paddingTop: 12, gap: 10 },
  selectedBadge: {
    backgroundColor: '#EBF2FC', borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 8, alignSelf: 'flex-start',
  },
  selectedBadgeText: { fontSize: 14, fontWeight: '600', color: '#1E6FD9' },
});
