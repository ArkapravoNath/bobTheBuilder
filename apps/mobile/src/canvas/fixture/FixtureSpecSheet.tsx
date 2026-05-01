import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch,
} from 'react-native';
import { C } from '../../theme/colors';
import type {
  CanvasFixture, DoorSpec, WindowSpec, StairSpec,
  DoorStyle, WindowStyle, GlazingType, StairDirection,
} from './fixtureTypes';

interface Props {
  fixture: CanvasFixture | null;
  onUpdateSpec: (id: string, patch: Partial<DoorSpec> | Partial<WindowSpec> | Partial<StairSpec>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// ── Reusable row components ───────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
}

function Pills<T extends string | number>({
  options, value, onSelect,
}: { options: { value: T; label: string }[]; value: T; onSelect: (v: T) => void }) {
  return (
    <View style={styles.pills}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.pill, value === opt.value && styles.pillActive]}
          onPress={() => onSelect(opt.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === opt.value }}
        >
          <Text style={[styles.pillText, value === opt.value && styles.pillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Stepper({
  value, step, min, max, format, onChange,
}: { value: number; step: number; min: number; max: number; format?: (v: number) => string; onChange: (v: number) => void }) {
  const fmt = format ?? ((v) => String(v));
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.max(min, value - step))}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Text style={styles.stepBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepValue}>{fmt(value)}</Text>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.min(max, value + step))}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Text style={styles.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const fmtIn = (v: number) => `${v}"`;
const fmtFt = (v: number) => `${Math.round(v / 12)} ft`;

// ── Spec panels ───────────────────────────────────────────────────────────────

function DoorPanel({ spec, onChange }: { spec: DoorSpec; onChange: (p: Partial<DoorSpec>) => void }) {
  const styles: DoorStyle[] = ['swing', 'sliding', 'double'];
  const materials: DoorSpec['material'][] = ['teak', 'aluminium', 'upvc'];
  return (
    <>
      <Row label="Style">
        <Pills
          options={styles.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          value={spec.style}
          onSelect={(style) => onChange({ style })}
        />
      </Row>
      <Row label="Width">
        <Stepper value={spec.widthIn} step={6} min={24} max={72} format={fmtIn} onChange={(widthIn) => onChange({ widthIn })} />
      </Row>
      <Row label="Material">
        <Pills
          options={materials.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
          value={spec.material}
          onSelect={(material) => onChange({ material })}
        />
      </Row>
      <Row label="Opens Inward">
        <View style={{ opacity: 0.5 }}>
          <Text style={{ color: C.muted, fontSize: 12 }}>Tap wall to toggle</Text>
        </View>
      </Row>
    </>
  );
}

function WindowPanel({ spec, onChange }: { spec: WindowSpec; onChange: (p: Partial<WindowSpec>) => void }) {
  const styles_: WindowStyle[] = ['casement', 'bay', 'french'];
  const glazings: GlazingType[] = ['single', 'double', 'tinted'];
  return (
    <>
      <Row label="Style">
        <Pills
          options={styles_.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          value={spec.style}
          onSelect={(style) => onChange({ style })}
        />
      </Row>
      <Row label="Width">
        <Stepper value={spec.widthIn} step={6} min={24} max={96} format={fmtIn} onChange={(widthIn) => onChange({ widthIn })} />
      </Row>
      <Row label="Height">
        <Stepper value={spec.heightIn} step={6} min={24} max={60} format={fmtIn} onChange={(heightIn) => onChange({ heightIn })} />
      </Row>
      <Row label="Glazing">
        <Pills
          options={glazings.map((g) => ({ value: g, label: g[0].toUpperCase() + g.slice(1) }))}
          value={spec.glazing}
          onSelect={(glazing) => onChange({ glazing })}
        />
      </Row>
      <Row label="Panes">
        <Pills
          options={[{ value: 2 as const, label: '2' }, { value: 3 as const, label: '3' }]}
          value={spec.panes}
          onSelect={(panes) => onChange({ panes })}
        />
      </Row>
    </>
  );
}

function StairPanel({ spec, onChange }: { spec: StairSpec; onChange: (p: Partial<StairSpec>) => void }) {
  const dirs: StairDirection[] = ['N', 'E', 'S', 'W'];
  const dirLabels: Record<StairDirection, string> = { N: '↑ N', E: '→ E', S: '↓ S', W: '← W' };
  return (
    <>
      <Row label="Direction">
        <Pills
          options={dirs.map((d) => ({ value: d, label: dirLabels[d] }))}
          value={spec.direction}
          onSelect={(direction) => onChange({ direction })}
        />
      </Row>
      <Row label="Width">
        <Stepper value={spec.widthIn} step={6} min={36} max={96} format={fmtIn} onChange={(widthIn) => onChange({ widthIn })} />
      </Row>
      <Row label="Run">
        <Stepper value={spec.runIn} step={12} min={60} max={240} format={fmtFt} onChange={(runIn) => onChange({ runIn })} />
      </Row>
      <Row label="Risers">
        <Stepper value={spec.riserCount} step={1} min={6} max={20} onChange={(riserCount) => onChange({ riserCount })} />
      </Row>
    </>
  );
}

// ── Main sheet ────────────────────────────────────────────────────────────────

const KIND_LABELS: Record<string, string> = { door: '🚪 Door', window: '🪟 Window', stairs: '🪜 Stairs' };

export function FixtureSpecSheet({ fixture, onUpdateSpec, onDelete, onClose }: Props) {
  if (!fixture) return null;

  function update(patch: Partial<DoorSpec> | Partial<WindowSpec> | Partial<StairSpec>) {
    onUpdateSpec(fixture!.id, patch);
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{KIND_LABELS[fixture.kind] ?? fixture.kind}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {fixture.kind === 'door' && (
            <DoorPanel spec={fixture.spec as DoorSpec} onChange={update} />
          )}
          {fixture.kind === 'window' && (
            <WindowPanel spec={fixture.spec as WindowSpec} onChange={update} />
          )}
          {fixture.kind === 'stairs' && (
            <StairPanel spec={fixture.spec as StairSpec} onChange={update} />
          )}
        </ScrollView>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => { onDelete(fixture.id); onClose(); }}
          accessibilityRole="button"
          accessibilityLabel="Delete fixture"
        >
          <Text style={styles.deleteBtnText}>Delete Fixture</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#1C1917',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#3D3A37',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2A2724',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#FDFCF9' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: '#8A857C' },
  body: { paddingHorizontal: 20, paddingVertical: 8 },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2A2724',
  },
  rowLabel: { fontSize: 14, color: '#FDFCF9', fontWeight: '600', flex: 1 },
  rowValue: { flex: 2, alignItems: 'flex-end' },

  pills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
  pill: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1,
    borderColor: '#3D3A37', backgroundColor: '#2A2724',
  },
  pillActive: { backgroundColor: C.teakLight, borderColor: C.teak },
  pillText: { fontSize: 12, color: '#8A857C', fontWeight: '600' },
  pillTextActive: { color: C.teak },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#2A2724', borderWidth: 1, borderColor: '#3D3A37',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnText: { fontSize: 18, color: '#FDFCF9', lineHeight: 22 },
  stepValue: { minWidth: 44, textAlign: 'center', fontSize: 14, color: '#FDFCF9', fontWeight: '600' },

  deleteBtn: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#2D1A1A', borderWidth: 1, borderColor: '#5C2E2E',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  deleteBtnText: { color: '#E07070', fontSize: 14, fontWeight: '700' },
});
