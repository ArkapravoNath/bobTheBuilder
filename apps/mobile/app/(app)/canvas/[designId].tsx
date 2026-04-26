import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Rect, Group } from '@shopify/react-native-skia';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CanvasView } from '../../../src/canvas/CanvasView';
import { useFloorStore } from '../../../src/canvas/floor/useFloorStore';
import { usePerfHarness, formatPerfReport } from '../../../src/canvas/perf/usePerfHarness';
import { RULER_SIZE } from '../../../src/canvas/constants';

// ── Demo: 100 rectangles (performance acceptance test) ───────────────────────

const ROOM_COLORS: Record<string, string> = {
  bedroom: '#C3D9F7',
  bathroom: '#D4EDE1',
  kitchen: '#FEF3C7',
  living: '#EDE8DE',
  dining: '#F3E8FF',
  utility: '#E5E7EB',
  garage: '#D1D5DB',
  balcony: '#DCFCE7',
  custom: '#FEE2E2',
};

interface DemoRoom {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: keyof typeof ROOM_COLORS;
}

function makeDemoRooms(count: number): DemoRoom[] {
  const rooms: DemoRoom[] = [];
  const cols = Math.ceil(Math.sqrt(count));
  const cellW = 180; // canvas units (15 ft)
  const cellH = 144; // canvas units (12 ft)
  const types = Object.keys(ROOM_COLORS) as Array<keyof typeof ROOM_COLORS>;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    rooms.push({
      id: `demo-${i}`,
      x: col * (cellW + 12),
      y: row * (cellH + 12),
      w: cellW - 4,
      h: cellH - 4,
      type: types[i % types.length],
    });
  }
  return rooms;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CanvasScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { width, height } = useWindowDimensions();
  const perf = usePerfHarness();
  const { floors, activeIndex, loadDesign } = useFloorStore();

  // Seed the floor store for the demo design
  useEffect(() => {
    if (designId === '__demo__') {
      loadDesign(
        [
          { index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] },
          { index: 1, label: 'First Floor',  heightFt: 10, rooms: [], stairs: [] },
          { index: 2, label: 'Second Floor', heightFt: 10, rooms: [], stairs: [] },
        ],
        'full_house',
      );
    }
  }, [designId]);

  const [perfVisible, setPerfVisible] = useState(false);
  const [perfStats, setPerfStats]     = useState('');

  // Canvas area below the top toolbar
  const TOOLBAR_H = 52;
  const canvasW = width;
  const canvasH = height - TOOLBAR_H;

  const demoRooms = useMemo(() => makeDemoRooms(100), []);

  function handlePerfToggle() {
    if (!perf.isRunning) {
      perf.start();
      setPerfStats('');
      setPerfVisible(true);
    } else {
      perf.stop();
      const stats  = perf.getStats();
      const report = formatPerfReport(stats, `canvas-${designId}`, 100);
      setPerfStats(report);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Toolbar ── */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.toolbarBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.toolbarIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.toolbarTitle} numberOfLines={1}>
          {floors[activeIndex]?.label ?? (designId === '__demo__' ? 'Canvas Demo' : `Design ${designId}`)}
        </Text>

        <TouchableOpacity
          onPress={handlePerfToggle}
          style={[styles.toolbarBtn, perf.isRunning && styles.toolbarBtnActive]}
          accessibilityRole="button"
          accessibilityLabel={perf.isRunning ? 'Stop perf recording' : 'Start perf recording'}
        >
          <Text style={styles.toolbarIcon}>⏱</Text>
        </TouchableOpacity>
      </View>

      {/* ── Canvas ── */}
      <CanvasView
        screenW={canvasW}
        screenH={canvasH}
        initialTx={RULER_SIZE + 20}
        initialTy={RULER_SIZE + 20}
      >
        {/* 100 demo rooms rendered as static Skia Rects inside the viewport Group */}
        {demoRooms.map((r) => (
          <Group key={r.id}>
            {/* Fill */}
            <Rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              color={ROOM_COLORS[r.type]}
            />
            {/* Border */}
            <Rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              color="rgba(42,40,37,0.25)"
              style="stroke"
              strokeWidth={1}
            />
          </Group>
        ))}
      </CanvasView>

      {/* ── Perf report panel ── */}
      {perfVisible && perfStats !== '' && (
        <View style={styles.perfPanel}>
          <Text style={styles.perfTitle}>Perf Report — 100 rooms</Text>
          <Text style={styles.perfBody}>{perfStats}</Text>
          <TouchableOpacity
            onPress={() => { setPerfVisible(false); setPerfStats(''); }}
            style={styles.perfClose}
          >
            <Text style={styles.perfCloseText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2A2825' },
  toolbar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2825',
    paddingHorizontal: 4,
  },
  toolbarBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toolbarBtnActive: { backgroundColor: '#1E6FD9' },
  toolbarIcon: { fontSize: 22, color: '#FBFAF7' },
  toolbarTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FBFAF7',
    textAlign: 'center',
  },
  perfPanel: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#2A2825',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A4744',
  },
  perfTitle: { color: '#FBFAF7', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  perfBody:  { color: '#8A857C', fontSize: 12, fontFamily: 'monospace' },
  perfClose: { alignSelf: 'flex-end', marginTop: 12, padding: 4 },
  perfCloseText: { color: '#1E6FD9', fontSize: 14, fontWeight: '600' },
});
