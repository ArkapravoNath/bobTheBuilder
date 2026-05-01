/**
 * Canvas preview story.
 * Renders the Skia canvas layers (Grid + Rooms + Fixtures) with static mock data
 * via real Reanimated shared values — no navigation or store wiring required.
 * This verifies that Skia rendering is healthy and palette/geometry looks correct.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import { GridLayer } from '../../canvas/layers/GridLayer';
import { RoomLayer } from '../../canvas/room/RoomLayer';
import { FixtureLayer } from '../../canvas/fixture/FixtureLayer';
import { RulerOverlay } from '../../canvas/layers/RulerOverlay';
import { FloorTabs } from '../../canvas/floor/FloorTabs';
import { useFloorStore } from '../../canvas/floor/useFloorStore';
import { withStoryWrapper } from '../hoc/withStoryWrapper';
import type { CanvasRoom } from '../../canvas/room/useRoomStore';
import type { CanvasFixture } from '../../canvas/fixture/fixtureTypes';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from '../../canvas/fixture/fixtureTypes';

// ── Mock data ─────────────────────────────────────────────────────────────────

function makeRoom(
  room: Omit<CanvasRoom, 'polygon' | 'finishes' | 'fixtures'>,
): CanvasRoom {
  return {
    ...room,
    polygon: [
      { x: room.x, y: room.y },
      { x: room.x + room.w, y: room.y },
      { x: room.x + room.w, y: room.y + room.h },
      { x: room.x, y: room.y + room.h },
    ],
    finishes: {},
    fixtures: [],
  };
}

const MOCK_ROOMS: CanvasRoom[] = [
  makeRoom({ id: 'r1', x: 0,   y: 0,   w: 180, h: 120, type: 'living',   label: 'Living Room', floorIndex: 0, ceilingHeight: 10 }),
  makeRoom({ id: 'r2', x: 180, y: 0,   w: 120, h: 120, type: 'bedroom',  label: 'Bedroom 1',   floorIndex: 0, ceilingHeight: 10 }),
  makeRoom({ id: 'r3', x: 0,   y: 120, w: 120, h: 100, type: 'kitchen',  label: 'Kitchen',     floorIndex: 0, ceilingHeight: 10 }),
  makeRoom({ id: 'r4', x: 120, y: 120, w: 80,  h: 100, type: 'bathroom', label: 'Bathroom',    floorIndex: 0, ceilingHeight: 10 }),
  makeRoom({ id: 'r5', x: 200, y: 120, w: 100, h: 100, type: 'dining',   label: 'Dining',      floorIndex: 0, ceilingHeight: 10 }),
];

const MOCK_FIXTURES: CanvasFixture[] = [
  {
    id: 'f1', kind: 'door', spec: { ...DEFAULT_DOOR },
    anchor: { roomId: 'r1', wall: 'S', positionAlongWall: 0.5, openInward: true },
    floorIndex: 0,
  },
  {
    id: 'f2', kind: 'window', spec: { ...DEFAULT_WINDOW },
    anchor: { roomId: 'r2', wall: 'E', positionAlongWall: 0.4, openInward: false },
    floorIndex: 0,
  },
];

// ── Canvas preview component ──────────────────────────────────────────────────

const W = 390;
const H = 580;

function StaticCanvas({
  selectedRoomId = null,
  selectedFixtureId = null,
  scale: scaleProp = 0.55,
}: {
  selectedRoomId?: string | null;
  selectedFixtureId?: string | null;
  scale?: number;
}) {
  const tx    = useSharedValue(40);
  const ty    = useSharedValue(48);
  const scale = useSharedValue(scaleProp);

  useEffect(() => {
    useFloorStore.setState({
      floors: [
        { index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] },
        { index: 1, label: 'First Floor',  heightFt: 10, rooms: [], stairs: [] },
      ],
      activeIndex: 0,
    });
  }, []);

  return (
    <View style={styles.shell}>
      {/* Toolbar stub */}
      <View style={styles.toolbar}>
        <Text style={styles.tbTitle}>Canvas Preview</Text>
      </View>

      {/* Canvas */}
      <View style={{ width: W, height: H }}>
        <Canvas style={StyleSheet.absoluteFill}>
          <GridLayer  tx={tx} ty={ty} scale={scale} screenW={W} screenH={H} />
          <RoomLayer
            rooms={MOCK_ROOMS}
            selectedId={selectedRoomId}
            tx={tx} ty={ty} scale={scale}
          />
          <FixtureLayer
            fixtures={MOCK_FIXTURES}
            rooms={MOCK_ROOMS}
            selectedId={selectedFixtureId}
            tx={tx} ty={ty} scale={scale}
          />
          <RulerOverlay tx={tx} ty={ty} scale={scale} screenW={W} screenH={H} />
        </Canvas>

        {/* Floor tabs overlay */}
        <FloorTabs screenH={H} />
      </View>

      {/* Estimate banner stub */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>Live estimate · {MOCK_ROOMS.length} rooms</Text>
          <Text style={styles.bannerAmount}>₹18.5L</Text>
        </View>
        <View style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>Full Estimate →</Text>
        </View>
      </View>
    </View>
  );
}

// ── Story metadata ─────────────────────────────────────────────────────────────

const meta = {
  title: 'Screens/CanvasPreview',
  component: StaticCanvas,
  decorators: [withStoryWrapper({ bg: 'dark', padding: 0, fill: true })],
  argTypes: {
    scale: {
      control: { type: 'range', min: 0.2, max: 1.5, step: 0.05 },
    },
    selectedRoomId: {
      control: { type: 'select' },
      options: [null, 'r1', 'r2', 'r3', 'r4', 'r5'],
    },
  },
  args: {
    scale: 0.55,
    selectedRoomId: null,
    selectedFixtureId: null,
  },
} satisfies Meta<typeof StaticCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ZoomedIn: Story = {
  args: { scale: 0.9 },
};

export const ZoomedOut: Story = {
  args: { scale: 0.3 },
};

export const RoomSelected: Story = {
  args: { selectedRoomId: 'r1', scale: 0.55 },
};

export const FixtureSelected: Story = {
  args: { selectedFixtureId: 'f1', scale: 0.65 },
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#1C1917', alignItems: 'center' },
  toolbar: {
    width: '100%', height: 52, backgroundColor: '#1C1917',
    justifyContent: 'center', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#2A2724',
  },
  tbTitle: { fontSize: 15, fontWeight: '600', color: '#FDFCF9' },
  banner: {
    width: '100%', height: 64,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1C1917', paddingHorizontal: 20,
  },
  bannerLabel:  { fontSize: 12, color: '#8A857C', marginBottom: 2 },
  bannerAmount: { fontSize: 20, fontWeight: '700', color: '#FDFCF9' },
  bannerBtn: {
    backgroundColor: '#A06A3A', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  bannerBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
