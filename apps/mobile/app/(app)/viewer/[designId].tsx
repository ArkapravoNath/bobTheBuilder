/**
 * 3D Model Viewer — Planner5D-style orthographic view.
 *
 * Sprint S2 scope: isometric 2.5D rendering via Skia.
 * Full WebGL (Three.js / Expo GL) is a Sprint S3 task.
 *
 * This screen shows:
 *  • Isometric projection of the floor plan rooms
 *  • Zone colour overlays (Living & Entertainment, Private, Utility)
 *  • Tap a surface → material picker sheet slides up
 *  • Floor level tabs (GROUND, FIRST FLOOR, ROOF)
 *  • Measure mode toggle
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Modal, Pressable,
} from 'react-native';
import { Canvas, Path, Rect, Skia, Group, Text as SkText, matchFont } from '@shopify/react-native-skia';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRoomStore } from '../../../src/canvas/room/useRoomStore';
import { useFloorStore } from '../../../src/canvas/floor/useFloorStore';
import { ROOM_PALETTE } from '../../../src/canvas/room/roomColors';
import { C } from '../../../src/theme/colors';

// ── Isometric projection helpers ──────────────────────────────────────────────
const ISO_SCALE  = 0.5;   // canvas unit → px at 1:1 before ISO
const ISO_X_TILT = 0.7;   // x compression factor
const ISO_Y_TILT = 0.4;   // y compression factor
const WALL_H     = 40;    // visual wall height in pixels

function isoProject(cx: number, cy: number, originX: number, originY: number) {
  const sx = cx * ISO_SCALE;
  const sy = cy * ISO_SCALE;
  return {
    x: originX + (sx - sy) * ISO_X_TILT,
    y: originY + (sx + sy) * ISO_Y_TILT,
  };
}

// ── Material options ──────────────────────────────────────────────────────────
interface Material { id: string; name: string; category: string; fill: string; premium?: boolean }

const MATERIALS: Material[] = [
  { id: 'vitrified',  name: 'Vitrified Tile',     category: 'MOST USED', fill: '#E8E4DC' },
  { id: 'marble',     name: 'Italian Marble',      category: 'MOST USED', fill: '#EDE8E0' },
  { id: 'teak',       name: 'Teak Wood Panelling', category: 'PREMIUM',   fill: '#8B5E3C', premium: true },
  { id: 'oak',        name: 'Light Oak',           category: 'MOST USED', fill: '#D4A574' },
  { id: 'granite',    name: 'Black Pearl Granite', category: 'PREMIUM',   fill: '#4A4540', premium: true },
  { id: 'concrete',   name: 'Polished Concrete',   category: 'MOST USED', fill: '#C8C4C0' },
  { id: 'plaster',    name: 'Plaster & Paint',     category: 'MOST USED', fill: '#F5F2EC' },
  { id: 'brass',      name: 'Brushed Brass',       category: 'PREMIUM',   fill: '#B8860B', premium: true },
];

// ── Zone legend ───────────────────────────────────────────────────────────────
const ZONES = [
  { label: 'Living & Entertainment', color: '#C4A882' },
  { label: 'Private Quarters',       color: '#A89880' },
  { label: 'Utility & Circulation',  color: '#9A9490' },
];

type ZoneKey = 'living' | 'private' | 'utility';
const ROOM_ZONE: Record<string, ZoneKey> = {
  living: 'living', dining: 'living',
  bedroom: 'private', bathroom: 'private',
  kitchen: 'utility', utility: 'utility', garage: 'utility',
  balcony: 'living', custom: 'private',
};
const ZONE_COLORS: Record<ZoneKey, string> = {
  living:  '#C4A88240',
  private: '#A8988040',
  utility: '#9A949040',
};

// ── Material Picker sheet ─────────────────────────────────────────────────────
interface PickerProps { visible: boolean; roomLabel: string; onClose: () => void }
function MaterialPicker({ visible, roomLabel, onClose }: PickerProps) {
  const [selected, setSelected] = useState('vitrified');
  const sections = ['MOST USED', 'PREMIUM'];

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={mpStyles.overlay} onPress={onClose}>
        <Pressable style={mpStyles.sheet} onPress={() => {}}>
          <View style={mpStyles.handle} />
          <Text style={mpStyles.zone}>{roomLabel.toUpperCase()}</Text>
          <Text style={mpStyles.title}>Wall Surface</Text>
          <Text style={mpStyles.sub}>Select a material to apply to this surface.</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sections.map((sec) => (
              <View key={sec}>
                <View style={mpStyles.sectionRow}>
                  <Text style={mpStyles.sectionLabel}>{sec}</Text>
                  {sec === 'PREMIUM' && <Text style={mpStyles.star}>★</Text>}
                </View>
                <View style={mpStyles.matGrid}>
                  {MATERIALS.filter((m) => m.category === sec).map((mat) => (
                    <TouchableOpacity
                      key={mat.id}
                      style={[mpStyles.matCard, selected === mat.id && mpStyles.matCardActive]}
                      onPress={() => setSelected(mat.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: selected === mat.id }}
                    >
                      <View style={[mpStyles.matSwatch, { backgroundColor: mat.fill }]} />
                      {selected === mat.id && (
                        <View style={mpStyles.checkBadge}><Text style={mpStyles.checkMark}>✓</Text></View>
                      )}
                      <Text style={mpStyles.matName}>{mat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={mpStyles.footer}>
            <Text style={mpStyles.costLabel}>ESTIMATED SURFACE IMPACT</Text>
            <Text style={mpStyles.cost}>+₹32,000</Text>
            <TouchableOpacity style={mpStyles.applyBtn} onPress={onClose} accessibilityRole="button">
              <Text style={mpStyles.applyTxt}>APPLY SELECTION →</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const mpStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(28,25,23,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  zone: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '700', color: C.ink, paddingHorizontal: 24, marginTop: 4 },
  sub: { fontSize: 14, color: C.muted, paddingHorizontal: 24, marginBottom: 20, lineHeight: 20 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5 },
  star: { fontSize: 12, color: C.teak },
  matGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  matCard: {
    width: '44%', borderRadius: 10, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', position: 'relative',
  },
  matCardActive: { borderColor: C.teak, borderWidth: 2 },
  matSwatch: { width: '100%', height: 100 },
  checkBadge: {
    position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.teak, justifyContent: 'center', alignItems: 'center',
  },
  checkMark: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  matName: { fontSize: 12, fontWeight: '600', color: C.ink, padding: 8 },
  footer: { borderTopWidth: 1, borderColor: C.border, paddingHorizontal: 24, paddingTop: 16 },
  costLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5 },
  cost: { fontSize: 22, fontWeight: '700', color: C.ink, marginBottom: 16 },
  applyBtn: { backgroundColor: C.cta, borderRadius: 6, height: 52, justifyContent: 'center', alignItems: 'center' },
  applyTxt: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ModelViewerScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { rooms } = useRoomStore();
  const { floors, activeIndex, setActiveIndex } = useFloorStore();

  const [measureMode, setMeasureMode] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const CANVAS_W = 390;
  const CANVAS_H = 380;
  const ORIGIN_X = CANVAS_W / 2;
  const ORIGIN_Y = 80;

  const activeRooms = rooms.filter((r) => r.floorIndex === activeIndex);
  const selectedRoom = activeRooms.find((r) => r.id === selectedRoomId);

  // Build isometric paths for each room
  function buildRoomIsoPaths() {
    const paths: Array<{ id: string; top: ReturnType<typeof Skia.Path.Make>; front: ReturnType<typeof Skia.Path.Make>; side: ReturnType<typeof Skia.Path.Make>; fill: string; zone: ZoneKey }> = [];

    for (const room of activeRooms) {
      const x1 = room.x, y1 = room.y, x2 = room.x + room.w, y2 = room.y + room.h;
      const zone: ZoneKey = ROOM_ZONE[room.type] ?? 'private';
      const fill = ROOM_PALETTE[room.type]?.fill ?? '#EDE8E0';

      const tl = isoProject(x1, y1, ORIGIN_X, ORIGIN_Y);
      const tr = isoProject(x2, y1, ORIGIN_X, ORIGIN_Y);
      const br = isoProject(x2, y2, ORIGIN_X, ORIGIN_Y);
      const bl = isoProject(x1, y2, ORIGIN_X, ORIGIN_Y);

      // Top face
      const top = Skia.Path.Make();
      top.moveTo(tl.x, tl.y); top.lineTo(tr.x, tr.y);
      top.lineTo(br.x, br.y); top.lineTo(bl.x, bl.y); top.close();

      // Front face (south-facing wall, extruded down)
      const front = Skia.Path.Make();
      front.moveTo(bl.x, bl.y); front.lineTo(br.x, br.y);
      front.lineTo(br.x, br.y + WALL_H); front.lineTo(bl.x, bl.y + WALL_H); front.close();

      // Right face (east-facing wall)
      const side = Skia.Path.Make();
      side.moveTo(tr.x, tr.y); side.lineTo(br.x, br.y);
      side.lineTo(br.x, br.y + WALL_H); side.lineTo(tr.x, tr.y + WALL_H); side.close();

      paths.push({ id: room.id, top, front, side, fill, zone });
    }
    return paths;
  }

  const isoPaths = buildRoomIsoPaths();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.tbBtn} accessibilityRole="button">
          <Text style={styles.tbIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.tbTitle}>3D Model Viewer</Text>
        <TouchableOpacity
          style={[styles.tbBtn, measureMode && styles.tbBtnActive]}
          onPress={() => setMeasureMode((v) => !v)}
        >
          <Text style={styles.tbIcon}>📏</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Isometric canvas */}
        <View style={styles.isoContainer}>
          <Canvas style={{ width: CANVAS_W, height: CANVAS_H }}>
            {/* Light background */}
            <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} color="#F0EDE8" />

            {/* Render rooms — back-to-front (painter's algorithm) */}
            {isoPaths.map(({ id, top, front, side, fill, zone }) => {
              const isSelected = id === selectedRoomId;
              const zoneAlpha = ZONE_COLORS[zone] ?? '#C4A88240';
              const strokeColor = isSelected ? '#A06A3A' : 'rgba(160,106,58,0.4)';

              return (
                <Group key={id}>
                  {/* Top face */}
                  <Path path={top} color={fill} />
                  <Path path={top} color={zoneAlpha} />
                  <Path path={top} color={strokeColor} style="stroke" strokeWidth={isSelected ? 2 : 1} />

                  {/* Front face — darker tint */}
                  <Path path={front} color={fill} opacity={0.72} />
                  <Path path={front} color="rgba(28,25,23,0.08)" />
                  <Path path={front} color={strokeColor} style="stroke" strokeWidth={isSelected ? 2 : 0.5} />

                  {/* Side (east) face — mid tint */}
                  <Path path={side} color={fill} opacity={0.85} />
                  <Path path={side} color="rgba(28,25,23,0.04)" />
                  <Path path={side} color={strokeColor} style="stroke" strokeWidth={isSelected ? 2 : 0.5} />
                </Group>
              );
            })}

            {/* Ground shadow plane */}
            {activeRooms.length === 0 && (
              <Path
                path={(() => {
                  const p = Skia.Path.Make();
                  const c = isoProject(0, 0, ORIGIN_X, ORIGIN_Y + 120);
                  p.addCircle(c.x, c.y, 60);
                  return p;
                })()}
                color="rgba(160,106,58,0.08)"
              />
            )}
          </Canvas>

          {/* Tap targets over isometric rooms */}
          {activeRooms.map((room) => {
            const tl = isoProject(room.x, room.y, ORIGIN_X, ORIGIN_Y);
            return (
              <TouchableOpacity
                key={room.id}
                style={[styles.isoTap, { left: tl.x - 20, top: tl.y - 12, width: 60, height: 40 }]}
                onPress={() => { setSelectedRoomId(room.id); setPickerVisible(true); }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${ROOM_PALETTE[room.type]?.label ?? room.type}`}
              />
            );
          })}

          {activeRooms.length === 0 && (
            <View style={styles.emptyIso}>
              <Text style={styles.emptyIsoText}>Draw rooms in 2D canvas first</Text>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={styles.info}>
          <Text style={styles.infoCaption}>PROJECT MODEL</Text>
          <Text style={styles.infoTitle}>
            {designId === '__demo__' ? 'Demo Residence' : `Design ${designId}`}
          </Text>
          <Text style={styles.infoSub}>
            Tap any surface to select it and apply materials.
            {measureMode ? ' Measure mode active.' : ''}
          </Text>
        </View>

        {/* Floor level tabs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STRUCTURAL LEVEL</Text>
          <View style={styles.levelTabs}>
            {floors.map((floor, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.levelTab, idx === activeIndex && styles.levelTabActive]}
                onPress={() => setActiveIndex(idx)}
                accessibilityRole="tab"
                accessibilityState={{ selected: idx === activeIndex }}
              >
                <Text style={[styles.levelTabText, idx === activeIndex && styles.levelTabTextActive]}>
                  {floor.label?.toUpperCase() ?? `FLOOR ${idx}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Zone legend */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SPACE ZONING</Text>
          {ZONES.map((z) => (
            <View key={z.label} style={styles.zoneRow}>
              <View style={[styles.zoneDot, { backgroundColor: z.color.slice(0, 7) }]} />
              <Text style={styles.zoneLabel}>{z.label}</Text>
            </View>
          ))}
        </View>

        {/* Primary materials */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIMARY MATERIALS</Text>
          <View style={styles.matChips}>
            {['Teak Panelling', 'Italian Marble', 'Polished Concrete', 'Plaster'].map((m) => (
              <View key={m} style={styles.matChip}>
                <View style={styles.matChipDot} />
                <Text style={styles.matChipText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Material picker */}
      <MaterialPicker
        visible={pickerVisible}
        roomLabel={selectedRoom ? ROOM_PALETTE[selectedRoom.type]?.label ?? selectedRoom.type : 'Room'}
        onClose={() => { setPickerVisible(false); setSelectedRoomId(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  toolbar: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tbBtn: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  tbBtnActive: { backgroundColor: C.teakLight },
  tbIcon: { fontSize: 22, color: C.ink },
  tbTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: C.ink, textAlign: 'center' },
  scroll: { flex: 1 },

  isoContainer: { width: '100%', height: 380, backgroundColor: '#F0EDE8', position: 'relative' },
  isoTap: { position: 'absolute' },
  emptyIso: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  emptyIsoText: { fontSize: 14, color: C.muted },

  info: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  infoCaption: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5, marginBottom: 4 },
  infoTitle: { fontSize: 28, fontWeight: '700', color: C.ink, marginBottom: 8 },
  infoSub: { fontSize: 14, color: C.muted, lineHeight: 20 },

  section: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5, marginBottom: 14 },

  levelTabs: { flexDirection: 'row', gap: 0, borderBottomWidth: 1, borderBottomColor: C.border },
  levelTab: { paddingVertical: 10, paddingHorizontal: 4, marginRight: 24 },
  levelTabActive: { borderBottomWidth: 2, borderBottomColor: C.teak },
  levelTabText: { fontSize: 13, fontWeight: '700', color: C.muted },
  levelTabTextActive: { color: C.ink },

  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  zoneDot: { width: 18, height: 18, borderRadius: 3 },
  zoneLabel: { fontSize: 15, color: C.ink },

  matChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  matChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: C.border, borderRadius: 6,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  matChipDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.teak },
  matChipText: { fontSize: 13, fontWeight: '500', color: C.ink },
});
