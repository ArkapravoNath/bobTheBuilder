import React from 'react';
import {
  View, Text, Modal, Pressable, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { RoomType } from '@bob/shared-schemas';
import { ROOM_PALETTE } from './roomColors';
import { C } from '../../theme/colors';

interface Props {
  visible: boolean;
  currentType: RoomType;
  onSelect: (type: RoomType) => void;
  onClose: () => void;
  onDelete: () => void;
}

const ROOM_TYPES = Object.keys(ROOM_PALETTE) as RoomType[];

export function RoomTypePicker({ visible, currentType, onSelect, onClose, onDelete }: Props) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Room Type</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
            {ROOM_TYPES.map((type) => {
              const p = ROOM_PALETTE[type];
              const isActive = type === currentType;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.cell, isActive && styles.cellActive, { borderColor: isActive ? p.stroke : C.border }]}
                  onPress={() => { onSelect(type); onClose(); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={p.label}
                >
                  {/* Colour swatch */}
                  <View style={[styles.swatch, { backgroundColor: p.fill, borderColor: p.stroke }]} />
                  <Text style={styles.cellIcon}>{p.icon}</Text>
                  <Text style={[styles.cellLabel, isActive && styles.cellLabelActive]} numberOfLines={2}>
                    {p.label}
                  </Text>
                  {isActive && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} accessibilityRole="button">
              <Text style={styles.deleteTxt}>🗑  Delete Room</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(28,25,23,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40, paddingTop: 12, maxHeight: '75%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', color: C.ink, paddingHorizontal: 24, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  cell: {
    width: '30%',
    borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface,
    paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 6,
    position: 'relative',
  },
  cellActive: { backgroundColor: C.teakLight },
  swatch: { width: 36, height: 36, borderRadius: 8, borderWidth: 1 },
  cellIcon: { fontSize: 20 },
  cellLabel: { fontSize: 11, color: C.secondary, textAlign: 'center', fontWeight: '500' },
  cellLabelActive: { color: C.teakDark, fontWeight: '700' },
  check: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.teak, justifyContent: 'center', alignItems: 'center',
  },
  checkText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderColor: C.border, paddingHorizontal: 24, paddingTop: 16 },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteTxt: { fontSize: 15, color: C.error, fontWeight: '600' },
});
