import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';
import { BuddyInput } from '../../src/components/BuddyInput';

export default function DetailsScreen() {
  const router = useRouter();
  const { archetype, city } = useLocalSearchParams<{ archetype: string; city: string }>();
  const { token, refreshUser } = useAuth();

  const [plotArea, setPlotArea] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFinish(skip = false) {
    setLoading(true);
    setError('');
    try {
      const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';
      const patch: Record<string, unknown> = {
        onboardingComplete: true,
      };
      if (!skip) {
        if (plotArea) patch.plot = { totalArea: Number(plotArea), unit: 'sqft' };
        if (budget) patch.budgetHint = Number(budget.replace(/,/g, ''));
      }
      const res = await fetch(`${API_BASE}/v1/me/onboarding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed to save details');
      await refreshUser();
      router.replace('/(app)/designs');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
            <View style={styles.progress}>
              <View style={[styles.progressDot, styles.progressDone]} />
              <View style={[styles.progressDot, styles.progressDone]} />
              <View style={[styles.progressDot, styles.progressActive]} />
            </View>
            <Text style={styles.step}>Step 3 of 3</Text>
          </View>

          <Text style={styles.headline}>A few more details</Text>
          <Text style={styles.sub}>
            Optional — helps us tailor your estimate baseline. You can always update these later.
          </Text>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Archetype</Text>
              <Text style={styles.summaryValue}>{archetype?.replace('_', ' ')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{city}</Text>
            </View>
          </View>

          {/* Inputs */}
          <BuddyInput
            label="Plot / Built-up Area (sqft)"
            value={plotArea}
            onChangeText={setPlotArea}
            placeholder="e.g. 2400"
            keyboardType="numeric"
            returnKeyType="next"
          />
          <BuddyInput
            label="Approximate Budget (₹)"
            value={budget}
            onChangeText={setBudget}
            placeholder="e.g. 80,00,000"
            keyboardType="numeric"
            returnKeyType="done"
          />

          {!!error && <Text style={styles.errorBanner}>{error}</Text>}

          {/* Actions */}
          <View style={styles.actions}>
            <BuddyButton
              label="Start Designing"
              onPress={() => handleFinish(false)}
              variant="primary"
              fullWidth
              loading={loading}
            />
            <TouchableOpacity
              onPress={() => handleFinish(true)}
              style={styles.skipBtn}
              accessibilityRole="button"
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFAF7' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backChevron: { fontSize: 28, color: '#2A2825', lineHeight: 32 },
  progress: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8E2D7' },
  progressDone: { backgroundColor: '#1E6FD9' },
  progressActive: { backgroundColor: '#1E6FD9', width: 24 },
  step: { fontSize: 13, color: '#8A857C' },
  headline: { fontSize: 28, fontWeight: '700', color: '#2A2825', marginBottom: 6 },
  sub: { fontSize: 14, color: '#8A857C', lineHeight: 20, marginBottom: 24 },
  summary: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E8E2D7', padding: 16, marginBottom: 28, gap: 12,
  },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 12, color: '#8A857C', marginBottom: 4, fontWeight: '500' },
  summaryValue: { fontSize: 15, fontWeight: '700', color: '#2A2825', textTransform: 'capitalize' },
  summaryDivider: { width: 1, backgroundColor: '#E8E2D7' },
  errorBanner: {
    backgroundColor: '#FDF0EE', borderRadius: 8, padding: 12,
    fontSize: 13, color: '#E74C3C', marginBottom: 16,
  },
  actions: { marginTop: 8, gap: 12 },
  skipBtn: { alignSelf: 'center', padding: 8 },
  skipText: { fontSize: 14, color: '#8A857C' },
});
