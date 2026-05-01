import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  useWindowDimensions, Alert,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { Canvas, Group } from '@shopify/react-native-skia';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFloorStore } from '../../../src/canvas/floor/useFloorStore';
import { useRoomStore } from '../../../src/canvas/room/useRoomStore';
import { RoomLayer } from '../../../src/canvas/room/RoomLayer';
import { RoomTypePicker } from '../../../src/canvas/room/RoomTypePicker';
import { GridLayer } from '../../../src/canvas/layers/GridLayer';
import { RulerOverlay } from '../../../src/canvas/layers/RulerOverlay';
import { FloorTabs } from '../../../src/canvas/floor/FloorTabs';
import { useViewport } from '../../../src/canvas/useViewport';
import { usePerfHarness, formatPerfReport } from '../../../src/canvas/perf/usePerfHarness';
import { RULER_SIZE, DEFAULT_SCALE } from '../../../src/canvas/constants';
import { screenToCanvas } from '../../../src/canvas/viewport';
import { C } from '../../../src/theme/colors';
import { formatINR } from '../../../src/utils/formatCurrency';
import { useFixtureStore } from '../../../src/canvas/fixture/useFixtureStore';
import { FixtureLayer } from '../../../src/canvas/fixture/FixtureLayer';
import { FixtureTray } from '../../../src/canvas/fixture/FixtureTray';
import { FixtureSpecSheet } from '../../../src/canvas/fixture/FixtureSpecSheet';
import { snapToWall } from '../../../src/canvas/fixture/wallSnap';
import type { RoomType } from '@bob/shared-schemas';
import type { DoorSpec, WindowSpec, StairSpec } from '../../../src/canvas/fixture/fixtureTypes';

type ToolMode = 'select' | 'draw' | 'fixture';

export default function CanvasScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { width, height } = useWindowDimensions();
  const TOOLBAR_H = 52;
  const canvasW = width;
  const canvasH = height - TOOLBAR_H;

  const { floors, activeIndex, loadDesign } = useFloorStore();
  const { rooms, selectedId, addRoom, selectRoom, setRoomType, deleteRoom, commitMove, setRooms } = useRoomStore();
  const {
    fixtures, selectedId: selectedFixtureId, activeTool,
    addFixture, removeFixture, selectFixture, updateSpec, setActiveTool, setFixtures,
  } = useFixtureStore();
  const perf = usePerfHarness();

  const [mode, setMode] = useState<ToolMode>('select');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [specSheetVisible, setSpecSheetVisible] = useState(false);
  const [perfStats, setPerfStats] = useState('');

  const { tx, ty, scale, gesture: viewportGesture } = useViewport(
    RULER_SIZE + 20, RULER_SIZE + 20, DEFAULT_SCALE,
  );

  // ── Draw-rect gesture ───────────────────────────────────────────────────────
  const drawStartX = useSharedValue(0);
  const drawStartY = useSharedValue(0);
  const drawCurX   = useSharedValue(0);
  const drawCurY   = useSharedValue(0);
  const isDrawing  = useSharedValue(false);

  const onAddRoom = (x: number, y: number, w: number, h: number) => {
    const norm = w < 0 ? { x: x + w, w: -w } : { x, w };
    const normH = h < 0 ? { y: y + h, h: -h } : { y, h };
    addRoom(norm.x, normH.y, norm.w, normH.h, activeIndex);
  };

  const drawGesture = Gesture.Pan()
    .minDistance(4)
    .onStart((e) => {
      'worklet';
      if (!isDrawing.value) return;
      const cp = screenToCanvas({ x: e.x, y: e.y }, { tx: tx.value, ty: ty.value, scale: scale.value });
      drawStartX.value = cp.x;
      drawStartY.value = cp.y;
      drawCurX.value   = cp.x;
      drawCurY.value   = cp.y;
    })
    .onUpdate((e) => {
      'worklet';
      if (!isDrawing.value) return;
      const cp = screenToCanvas({ x: e.x, y: e.y }, { tx: tx.value, ty: ty.value, scale: scale.value });
      drawCurX.value = cp.x;
      drawCurY.value = cp.y;
    })
    .onEnd(() => {
      'worklet';
      if (!isDrawing.value) return;
      const w = drawCurX.value - drawStartX.value;
      const h = drawCurY.value - drawStartY.value;
      if (Math.abs(w) > 10 && Math.abs(h) > 10) {
        runOnJS(onAddRoom)(drawStartX.value, drawStartY.value, w, h);
        runOnJS(setMode)('select');
      }
      isDrawing.value = false;
    });

  // Ghost rect while drawing
  const ghostRect = useDerivedValue(() => {
    if (!isDrawing.value) return null;
    const s  = scale.value;
    const ox = tx.value;
    const oy = ty.value;
    return {
      x: drawStartX.value * s + ox,
      y: drawStartY.value * s + oy,
      w: (drawCurX.value - drawStartX.value) * s,
      h: (drawCurY.value - drawStartY.value) * s,
    };
  }, [tx, ty, scale, drawStartX, drawStartY, drawCurX, drawCurY, isDrawing]);

  // ── Fixture placement tap ───────────────────────────────────────────────────
  function handleFixtureTap(screenX: number, screenY: number) {
    if (!activeTool) return;
    const canvasPoint = screenToCanvas(
      { x: screenX, y: screenY },
      { tx: tx.value, ty: ty.value, scale: scale.value },
    );
    const anchor = snapToWall(canvasPoint, rooms, activeIndex);
    if (!anchor) return;
    addFixture(activeTool, anchor, activeIndex);
    // Keep tool active so user can place multiple fixtures
  }

  const composedGesture = mode === 'draw'
    ? Gesture.Race(drawGesture)
    : Gesture.Race(viewportGesture);

  // Start each opened design from a clean local workspace until API-backed loading is wired.
  useEffect(() => {
    setRooms([]);
    setFixtures([]);
    selectRoom(null);
    selectFixture(null);
    setActiveTool(null);
    setMode('select');
    isDrawing.value = false;
    setPickerVisible(false);
    setSpecSheetVisible(false);
    setPerfStats('');
    loadDesign([
      { index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] },
      { index: 1, label: 'First Floor',  heightFt: 10, rooms: [], stairs: [] },
    ], 'full_house');
  }, [designId, isDrawing, loadDesign, selectFixture, selectRoom, setActiveTool, setFixtures, setRooms]);

  // Active floor rooms only
  const activeRooms = rooms.filter((r) => r.floorIndex === activeIndex);
  const selectedRoom = activeRooms.find((r) => r.id === selectedId);

  // Estimate total from rooms (rough: area × ₹1800/sqft)
  const estimateLive = activeRooms.reduce((acc, r) => acc + (r.w * r.h) / 144 * 1800, 0);

  function handlePerfToggle() {
    if (!perf.isRunning) { perf.start(); }
    else {
      perf.stop();
      setPerfStats(formatPerfReport(perf.getStats(), `canvas-${designId}`, activeRooms.length));
    }
  }

  function handleCanvasPress(e: { nativeEvent: { locationX: number; locationY: number } }) {
    if (activeTool) {
      handleFixtureTap(e.nativeEvent.locationX, e.nativeEvent.locationY);
    } else if (mode === 'select') {
      selectRoom(null);
      selectFixture(null);
    }
  }

  const selectedFixture = fixtures.find((f) => f.id === selectedFixtureId) ?? null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.tbBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.tbIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.tbTitle} numberOfLines={1}>
          {floors[activeIndex]?.label ?? 'Canvas'}
        </Text>
        {/* Tool mode toggle */}
        <TouchableOpacity
          style={[styles.tbBtn, mode === 'draw' && styles.tbBtnActive]}
          onPress={() => {
            const next = mode === 'draw' ? 'select' : 'draw';
            setMode(next);
            if (next === 'draw') isDrawing.value = true;
            else { isDrawing.value = false; selectRoom(null); }
          }}
          accessibilityRole="button"
          accessibilityLabel={mode === 'draw' ? 'Switch to select mode' : 'Draw room'}
        >
          <Text style={styles.tbIcon}>{mode === 'draw' ? '✕' : '▭'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tbBtn, perf.isRunning && styles.tbBtnActive]}
          onPress={handlePerfToggle}
          accessibilityRole="button"
        >
          <Text style={styles.tbIcon}>⏱</Text>
        </TouchableOpacity>
      </View>

      {/* Draw mode hint */}
      {mode === 'draw' && (
        <View style={styles.drawHint}>
          <Text style={styles.drawHintText}>Drag to draw a room · tap ✕ to cancel</Text>
        </View>
      )}

      {/* Canvas */}
      <GestureDetector gesture={composedGesture}>
        <View
          style={[styles.canvasWrap, { width: canvasW, height: canvasH }]}
          onTouchEnd={handleCanvasPress}
        >
          <Canvas style={StyleSheet.absoluteFill}>
            <GridLayer tx={tx} ty={ty} scale={scale} screenW={canvasW} screenH={canvasH} />

            {/* Rooms */}
            <RoomLayer
              rooms={activeRooms}
              selectedId={selectedId}
              tx={tx} ty={ty} scale={scale}
            />

            {/* Fixtures */}
            <FixtureLayer
              fixtures={fixtures.filter((f) => f.floorIndex === activeIndex)}
              rooms={activeRooms}
              selectedId={selectedFixtureId}
              tx={tx} ty={ty} scale={scale}
            />

            <RulerOverlay tx={tx} ty={ty} scale={scale} screenW={canvasW} screenH={canvasH} />
          </Canvas>

          {/* Floor tabs */}
          <FloorTabs screenH={canvasH} />

          {/* Fixture placement hint */}
          {activeTool && (
            <View style={styles.fixturePlaceHint} pointerEvents="none">
              <Text style={styles.fixturePlaceHintText}>
                Tap near a wall to place · tap tray icon again to cancel
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>

      {/* Fixture tray */}
      <FixtureTray
        activeTool={activeTool}
        onSelectTool={(kind) => {
          setActiveTool(kind);
          if (kind) setMode('select'); // ensure viewport pan works while placing
        }}
      />

      {/* Bottom estimate banner */}
      <View style={styles.estimateBanner}>
        <View>
          <Text style={styles.estimateLabel}>Live estimate · {activeRooms.length} rooms</Text>
          <Text style={styles.estimateAmount}>{formatINR(estimateLive)}</Text>
        </View>
        {selectedFixture && !selectedRoom && (
          <TouchableOpacity
            style={styles.roomBtn}
            onPress={() => setSpecSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Edit fixture"
          >
            <Text style={styles.roomBtnText}>Edit Fixture</Text>
          </TouchableOpacity>
        )}
        {selectedRoom && (
          <TouchableOpacity
            style={styles.roomBtn}
            onPress={() => setPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Change room type"
          >
            <Text style={styles.roomBtnText}>Change Type</Text>
          </TouchableOpacity>
        )}
        {!selectedRoom && !selectedFixture && (
          <TouchableOpacity style={styles.roomBtn} onPress={() => router.push(`/(app)/estimate/${designId}`)} accessibilityRole="button">
            <Text style={styles.roomBtnText}>Full Estimate →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Room type picker */}
      {selectedRoom && (
        <RoomTypePicker
          visible={pickerVisible}
          currentType={selectedRoom.type}
          onSelect={(type: RoomType) => setRoomType(selectedRoom.id, type)}
          onClose={() => setPickerVisible(false)}
          onDelete={() => { setPickerVisible(false); deleteRoom(selectedRoom.id); }}
        />
      )}

      {/* Fixture spec sheet */}
      {specSheetVisible && selectedFixture && (
        <FixtureSpecSheet
          fixture={selectedFixture}
          onUpdateSpec={(id, patch) => updateSpec(id, patch as Partial<DoorSpec>)}
          onDelete={(id) => { removeFixture(id); setSpecSheetVisible(false); }}
          onClose={() => setSpecSheetVisible(false)}
        />
      )}

      {/* Perf report */}
      {perfStats !== '' && (
        <View style={styles.perfPanel}>
          <Text style={styles.perfTitle}>Perf Report</Text>
          <Text style={styles.perfBody}>{perfStats}</Text>
          <TouchableOpacity onPress={() => setPerfStats('')}>
            <Text style={styles.perfClose}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1C1917' },
  toolbar: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1917', paddingHorizontal: 4,
  },
  tbBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  tbBtnActive: { backgroundColor: C.teak },
  tbIcon: { fontSize: 22, color: '#FDFCF9' },
  tbTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FDFCF9', textAlign: 'center' },

  drawHint: {
    position: 'absolute', top: 60, left: 0, right: 0, zIndex: 100,
    alignItems: 'center',
  },
  drawHintText: {
    backgroundColor: 'rgba(28,25,23,0.85)', color: '#F5F2EC',
    fontSize: 13, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },

  canvasWrap: { backgroundColor: '#F5F2EC', overflow: 'hidden' },

  estimateBanner: {
    height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1C1917', paddingHorizontal: 20,
  },
  estimateLabel:  { fontSize: 12, color: '#8A857C', marginBottom: 2 },
  estimateAmount: { fontSize: 20, fontWeight: '700', color: '#FDFCF9', fontFamily: 'Georgia' },
  roomBtn: {
    backgroundColor: C.teak, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  roomBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  perfPanel: {
    position: 'absolute', bottom: 80, left: 16, right: 16,
    backgroundColor: '#1C1917', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#3D3A37',
  },
  perfTitle: { color: '#FDFCF9', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  perfBody:  { color: '#8A857C', fontSize: 11, fontFamily: 'monospace' },
  perfClose: { color: C.teak, fontSize: 13, fontWeight: '600', marginTop: 10, textAlign: 'right' },

  fixturePlaceHint: {
    position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center',
  },
  fixturePlaceHintText: {
    backgroundColor: 'rgba(160,106,58,0.92)', color: '#FDFCF9',
    fontSize: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    overflow: 'hidden',
  },
});
