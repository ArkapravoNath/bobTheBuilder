import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { C } from '../../theme/colors';
import { TRAY_ITEMS } from './fixtureTypes';
import type { FixtureKind } from './fixtureTypes';

interface Props {
  activeTool: FixtureKind | null;
  onSelectTool: (kind: FixtureKind | null) => void;
}

export function FixtureTray({ activeTool, onSelectTool }: Props) {
  return (
    <View style={styles.tray}>
      <Text style={styles.label}>FIXTURES</Text>

      <View style={styles.items}>
        {TRAY_ITEMS.map((item) => {
          const active = activeTool === item.kind;
          return (
            <TouchableOpacity
              key={item.kind}
              style={[styles.item, active && styles.itemActive]}
              onPress={() => onSelectTool(active ? null : item.kind)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} fixture tool`}
              accessibilityState={{ selected: active }}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTool && (
        <Text style={styles.hint}>Tap a room wall to place · tap again to cancel</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#3D3A37',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A857C',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  items: {
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#2A2724',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3D3A37',
    minWidth: 64,
  },
  itemActive: {
    backgroundColor: C.teakLight,
    borderColor: C.teak,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  itemLabel: {
    fontSize: 11,
    color: '#8A857C',
    fontWeight: '600',
  },
  itemLabelActive: {
    color: C.teak,
  },
  hint: {
    marginTop: 8,
    fontSize: 11,
    color: '#6B6560',
    textAlign: 'center',
  },
});
