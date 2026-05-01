import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '../action';
import { FixtureSpecSheet } from '../../canvas/fixture/FixtureSpecSheet';
import type { CanvasFixture, DoorSpec, WindowSpec, StairSpec } from '../../canvas/fixture/fixtureTypes';
import { DEFAULT_DOOR, DEFAULT_WINDOW, DEFAULT_STAIR } from '../../canvas/fixture/fixtureTypes';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

const meta = {
  title: 'Canvas/FixtureSpecSheet',
  component: FixtureSpecSheet,
  decorators: [withStoryWrapper({ bg: 'cream', padding: 0, fill: true })],
} satisfies Meta<typeof FixtureSpecSheet>;

export default meta;
type Story = StoryObj;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFixture(kind: CanvasFixture['kind'], spec: DoorSpec | WindowSpec | StairSpec): CanvasFixture {
  return { id: 'story-fixture', kind, spec, anchor: null, floorIndex: 0 };
}

function SheetStory({ kind, spec }: { kind: CanvasFixture['kind']; spec: DoorSpec | WindowSpec | StairSpec }) {
  const [fixture, setFixture] = useState<CanvasFixture>(makeFixture(kind, spec));
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{kind.toUpperCase()} SPEC SHEET</Text>
      {!open && (
        <TouchableOpacity style={styles.openBtn} onPress={() => setOpen(true)}>
          <Text style={styles.openBtnText}>Open Sheet</Text>
        </TouchableOpacity>
      )}
      <FixtureSpecSheet
        fixture={open ? fixture : null}
        onUpdateSpec={(_id, patch) =>
          setFixture((f) => ({ ...f, spec: { ...f.spec, ...patch } as CanvasFixture['spec'] }))
        }
        onDelete={action('delete-fixture')}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Door: Story = {
  render: () => <SheetStory kind="door" spec={{ ...DEFAULT_DOOR }} />,
};

export const Window: Story = {
  render: () => <SheetStory kind="window" spec={{ ...DEFAULT_WINDOW }} />,
};

export const Stair: Story = {
  render: () => <SheetStory kind="stairs" spec={{ ...DEFAULT_STAIR }} />,
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1C1917' },
  label: {
    color: '#8A857C', fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    padding: 16, paddingBottom: 0,
  },
  openBtn: {
    margin: 20, backgroundColor: '#A06A3A', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  openBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
