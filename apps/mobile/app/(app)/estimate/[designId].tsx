import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFloorStore } from '../../../src/canvas/floor/useFloorStore';
import { useRoomStore } from '../../../src/canvas/room/useRoomStore';
import { C } from '../../../src/theme/colors';
import { formatINR, fullINR } from '../../../src/utils/formatCurrency';
import type { RoomType } from '@bob/shared-schemas';

const RATE_PER_SQFT = 1800; // ₹/sqft — materials + 40% labour

const ROOM_LABEL: Record<RoomType, string> = {
  bedroom:  'Bedroom',
  bathroom: 'Bathroom',
  kitchen:  'Kitchen',
  living:   'Living Room',
  dining:   'Dining Room',
  utility:  'Utility',
  garage:   'Garage',
  balcony:  'Balcony',
  custom:   'Custom Room',
};

export default function EstimateScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { floors, activeIndex } = useFloorStore();
  const { rooms } = useRoomStore();

  const activeRooms = rooms.filter((r) => r.floorIndex === activeIndex);
  const floor = floors[activeIndex];

  const roomsWithCost = activeRooms.map((r) => {
    const sqft = (r.w * r.h) / 144;
    const cost = sqft * RATE_PER_SQFT;
    return { ...r, sqft, cost };
  });

  const totalCost = roomsWithCost.reduce((acc, r) => acc + r.cost, 0);
  const totalArea = roomsWithCost.reduce((acc, r) => acc + r.sqft, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Full Estimate</Text>
          <Text style={styles.headerSub}>{floor?.label ?? 'Ground Floor'}</Text>
        </View>
        {/* Spacer keeps title centred */}
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL CONSTRUCTION COST</Text>
          <Text style={styles.summaryAmount}>{fullINR(totalCost)}</Text>
          <Text style={styles.summaryMeta}>
            {totalArea.toFixed(1)} sqft · ₹{RATE_PER_SQFT.toLocaleString('en-IN')}/sqft
          </Text>
        </View>

        {/* Per-room breakdown */}
        <Text style={styles.sectionTitle}>ROOM BREAKDOWN</Text>

        {roomsWithCost.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rooms on this floor yet.</Text>
            <Text style={styles.emptyHint}>Go back and draw rooms on the canvas first.</Text>
          </View>
        ) : (
          <View style={styles.breakdownCard}>
            {roomsWithCost.map((r, i) => (
              <View
                key={r.id}
                style={[styles.roomRow, i < roomsWithCost.length - 1 && styles.rowDivider]}
              >
                <View style={styles.roomInfo}>
                  <Text style={styles.roomType}>
                    {ROOM_LABEL[r.type] ?? r.type}
                  </Text>
                  <Text style={styles.roomDims}>
                    {(r.w / 12).toFixed(1)}′ × {(r.h / 12).toFixed(1)}′ · {r.sqft.toFixed(1)} sqft
                  </Text>
                </View>
                <Text style={styles.roomCost}>{formatINR(r.cost)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Rate disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Rate: ₹{RATE_PER_SQFT.toLocaleString('en-IN')}/sqft covers materials + 40% labour overhead.
            Regional multipliers and finish-level upgrades arrive in v2.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1C1917' },

  header: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1917', paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#3D3A37',
  },
  headerBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 28, color: '#FDFCF9' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FDFCF9' },
  headerSub: { fontSize: 12, color: '#8A857C', marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  summaryCard: {
    backgroundColor: '#28231F', borderRadius: 16, padding: 24,
    marginBottom: 28, alignItems: 'center',
    borderWidth: 1, borderColor: '#3D3A37',
  },
  summaryLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: '#8A857C', marginBottom: 10,
  },
  summaryAmount: {
    fontSize: 34, fontWeight: '700', color: '#FDFCF9',
    fontFamily: 'Georgia', marginBottom: 8,
  },
  summaryMeta: { fontSize: 13, color: '#8A857C' },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: '#8A857C', marginBottom: 12,
  },

  breakdownCard: {
    backgroundColor: '#28231F', borderRadius: 16,
    borderWidth: 1, borderColor: '#3D3A37', overflow: 'hidden',
    marginBottom: 20,
  },
  roomRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#3D3A37' },
  roomInfo: { flex: 1, marginRight: 12 },
  roomType: { fontSize: 15, fontWeight: '600', color: '#FDFCF9', marginBottom: 3 },
  roomDims: { fontSize: 12, color: '#8A857C' },
  roomCost: { fontSize: 16, fontWeight: '700', color: C.teak },

  emptyState: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8A857C', marginBottom: 8 },
  emptyHint: { fontSize: 13, color: '#5A5550', textAlign: 'center' },

  disclaimer: {
    padding: 16, backgroundColor: '#28231F',
    borderRadius: 12, borderWidth: 1, borderColor: '#3D3A37',
  },
  disclaimerText: { fontSize: 12, color: '#5A5550', lineHeight: 18 },
});
