import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';
import type { Design } from '@bob/shared-schemas';

const STATUS_COLORS: Record<string, string> = {
  draft: '#F39C12',
  saved: '#27AE60',
  shared: '#1E6FD9',
  archived: '#8A857C',
};

const ARCHETYPE_ICONS: Record<string, string> = {
  single_room: '🚪',
  partial_home: '🏠',
  full_house: '🏡',
  mansion: '🏰',
};

const LOCAL_DEV_DESIGNS: Design[] = [
  {
    id: 'dev-demo-house',
    name: 'Dev Demo House',
    archetype: 'full_house',
    status: 'draft',
    location: { city: 'Mumbai' },
    floors: [
      { index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] },
      { index: 1, label: 'First Floor', heightFt: 10, rooms: [], stairs: [] },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as unknown as Design,
];

export default function DesignsScreen() {
  const router = useRouter();
  const { user, token, signOut } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';
  const isLocalDevSession = token?.startsWith('dev-token-local') ?? false;

  async function fetchDesigns(silent = false) {
    if (!silent) setLoading(true);
    setError('');
    try {
      if (isLocalDevSession) {
        setDesigns(LOCAL_DEV_DESIGNS);
        return;
      }
      const res = await fetch(`${API_BASE}/v1/designs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load designs');
      const { data } = (await res.json()) as { data: Design[] };
      setDesigns(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchDesigns(); }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchDesigns(true);
  }

  function startNewDesign() {
    router.push(`/(app)/canvas/local-${Date.now()}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'My Projects'}
          </Text>
          <Text style={styles.subtitle}>
            {designs.length > 0 ? `${designs.length} design${designs.length !== 1 ? 's' : ''}` : 'No designs yet'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => signOut()}
            style={styles.profileBtn}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={styles.profileInitials}>
              {(user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* New Design CTA */}
      <View style={styles.newDesignBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Start a new design</Text>
          <Text style={styles.bannerDesc}>Draw rooms, pick finishes, get an estimate</Text>
        </View>
        <BuddyButton
          label="+ New"
          onPress={startNewDesign}
          variant="primary"
          style={styles.newBtn}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E6FD9" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <BuddyButton label="Retry" onPress={() => fetchDesigns()} variant="secondary" style={{ marginTop: 16 }} />
        </View>
      ) : designs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✏️</Text>
          <Text style={styles.emptyTitle}>No designs yet</Text>
          <Text style={styles.emptyDesc}>
            Tap "+ New" above to start drawing your floor plan and get an instant cost estimate.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E6FD9" />}
          showsVerticalScrollIndicator={false}
        >
          {designs.map((design) => (
            <TouchableOpacity
              key={design.id}
              style={styles.card}
              onPress={() => router.push(`/(app)/canvas/${design.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Design: ${design.name}`}
              activeOpacity={0.88}
            >
              {/* Thumbnail placeholder */}
              <View style={styles.cardThumb}>
                <Text style={styles.cardThumbIcon}>{ARCHETYPE_ICONS[design.archetype] ?? '🏠'}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardName} numberOfLines={1}>{design.name}</Text>
                  <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLORS[design.status] ?? '#8A857C'}20` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[design.status] ?? '#8A857C' }]}>
                      {design.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>
                  {design.location.city}  ·  {design.floors.length} floor{design.floors.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.cardDate}>
                  Updated {new Date(design.updatedAt ?? design.createdAt ?? Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFAF7' },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  greeting: { fontSize: 26, fontWeight: '700', color: '#2A2825' },
  subtitle: { fontSize: 14, color: '#8A857C', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E6FD9',
    justifyContent: 'center', alignItems: 'center',
  },
  profileInitials: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  newDesignBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#EBF2FC', borderRadius: 14, padding: 16, gap: 12,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#1E6FD9' },
  bannerDesc: { fontSize: 13, color: '#4A4744', marginTop: 2 },
  newBtn: { minWidth: 80, height: 40, borderRadius: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  errorText: { fontSize: 14, color: '#E74C3C', textAlign: 'center' },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#2A2825', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#8A857C', textAlign: 'center', lineHeight: 22 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E8E2D7', padding: 14, gap: 14,
    shadowColor: '#2A2825', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardThumb: {
    width: 56, height: 56, borderRadius: 10, backgroundColor: '#F5F2EC',
    justifyContent: 'center', alignItems: 'center',
  },
  cardThumbIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#2A2825', flex: 1, marginRight: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardMeta: { fontSize: 13, color: '#8A857C' },
  cardDate: { fontSize: 12, color: '#C4C0BA', marginTop: 2 },
  chevron: { fontSize: 20, color: '#C4C0BA' },
});
