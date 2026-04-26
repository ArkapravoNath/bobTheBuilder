import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { useFloorStore } from './useFloorStore';
import { RULER_SIZE } from '../constants';

const TAB_H = 52;
const TAB_W = RULER_SIZE; // sits over the ruler's left column

// ── Individual floor tab ──────────────────────────────────────────────────────

interface TabProps {
  label: string;
  index: number;
  isActive: boolean;
  canDelete: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function FloorTab({ label, isActive, onPress, onLongPress }: TabProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.tabActive]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
      activeOpacity={0.75}
    >
      {/* Label is rotated 90° so it reads bottom-to-top along the left edge */}
      <Text
        style={[styles.tabLabel, isActive && styles.tabLabelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Rename modal ──────────────────────────────────────────────────────────────

interface RenameModalProps {
  visible: boolean;
  currentLabel: string;
  onConfirm: (label: string) => void;
  onCancel: () => void;
}

function RenameModal({ visible, currentLabel, onConfirm, onCancel }: RenameModalProps) {
  const [value, setValue] = useState(currentLabel);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>Rename floor</Text>
          <TextInput
            style={styles.modalInput}
            value={value}
            onChangeText={setValue}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={() => onConfirm(value.trim() || currentLabel)}
            accessibilityLabel="Floor name"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onCancel} style={styles.modalBtn}>
              <Text style={styles.modalBtnCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(value.trim() || currentLabel)}
              style={[styles.modalBtn, styles.modalBtnConfirmBg]}
            >
              <Text style={styles.modalBtnConfirm}>Rename</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Floor action sheet ────────────────────────────────────────────────────────

interface ActionSheetProps {
  visible: boolean;
  index: number;
  label: string;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRename: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
}

function FloorActionSheet({
  visible,
  label,
  canDelete,
  canMoveUp,
  canMoveDown,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  onClose,
}: ActionSheetProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{label}</Text>

          <TouchableOpacity style={styles.sheetRow} onPress={onRename}>
            <Text style={styles.sheetIcon}>✏️</Text>
            <Text style={styles.sheetRowText}>Rename floor</Text>
          </TouchableOpacity>

          {canMoveUp && (
            <TouchableOpacity style={styles.sheetRow} onPress={onMoveUp}>
              <Text style={styles.sheetIcon}>⬆️</Text>
              <Text style={styles.sheetRowText}>Move up</Text>
            </TouchableOpacity>
          )}

          {canMoveDown && (
            <TouchableOpacity style={styles.sheetRow} onPress={onMoveDown}>
              <Text style={styles.sheetIcon}>⬇️</Text>
              <Text style={styles.sheetRowText}>Move down</Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity style={styles.sheetRow} onPress={onDelete}>
              <Text style={styles.sheetIcon}>🗑️</Text>
              <Text style={[styles.sheetRowText, styles.sheetRowDanger]}>Delete floor</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.sheetRow, styles.sheetCancel]} onPress={onClose}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main FloorTabs component ──────────────────────────────────────────────────

interface Props {
  /** Canvas height in screen pixels — needed to position the + button. */
  screenH: number;
}

export function FloorTabs({ screenH }: Props) {
  const { floors, activeIndex, addFloor, removeFloor, renameFloor, reorderFloor, setActiveIndex } =
    useFloorStore();

  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [renameIndex, setRenameIndex] = useState<number | null>(null);

  const activeFloor = actionIndex !== null ? floors[actionIndex] : null;

  function handleLongPress(index: number) {
    setActionIndex(index);
  }

  function handleRename(index: number) {
    setActionIndex(null);
    setRenameIndex(index);
  }

  function handleRenameConfirm(label: string) {
    if (renameIndex !== null) renameFloor(renameIndex, label);
    setRenameIndex(null);
  }

  function handleDelete(index: number) {
    setActionIndex(null);
    Alert.alert(
      'Delete floor',
      `Delete "${floors[index].label}" and all its rooms?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeFloor(index),
        },
      ],
    );
  }

  return (
    <>
      {/* Vertical tab strip — sits at left edge, below the ruler */}
      <View
        style={[styles.strip, { top: RULER_SIZE, maxHeight: screenH - RULER_SIZE - TAB_H - 8 }]}
        pointerEvents="box-none"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[...floors].reverse().map((floor) => {
            // Render bottom (ground floor) first in visual order = last in array reversed
            const realIndex = floors.indexOf(floor);
            return (
              <FloorTab
                key={`floor-${realIndex}-${floor.label}`}
                label={floor.label ?? `Floor ${realIndex}`}
                index={realIndex}
                isActive={realIndex === activeIndex}
                canDelete={floors.length > 1}
                onPress={() => setActiveIndex(realIndex)}
                onLongPress={() => handleLongPress(realIndex)}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Add floor button — fixed at bottom of strip */}
      <TouchableOpacity
        style={[styles.addBtn, { bottom: screenH - RULER_SIZE - (floors.length * TAB_H) - TAB_H - 4 + RULER_SIZE }]}
        onPress={addFloor}
        accessibilityRole="button"
        accessibilityLabel="Add floor"
      >
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>

      {/* Action sheet */}
      {activeFloor && actionIndex !== null && (
        <FloorActionSheet
          visible
          index={actionIndex}
          label={activeFloor.label ?? `Floor ${actionIndex}`}
          canDelete={floors.length > 1}
          canMoveUp={actionIndex < floors.length - 1}
          canMoveDown={actionIndex > 0}
          onRename={() => handleRename(actionIndex)}
          onDelete={() => handleDelete(actionIndex)}
          onMoveUp={() => { reorderFloor(actionIndex, actionIndex + 1); setActionIndex(null); }}
          onMoveDown={() => { reorderFloor(actionIndex, actionIndex - 1); setActionIndex(null); }}
          onClose={() => setActionIndex(null)}
        />
      )}

      {/* Rename modal */}
      {renameIndex !== null && (
        <RenameModal
          visible
          currentLabel={floors[renameIndex]?.label ?? `Floor ${renameIndex}`}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenameIndex(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    left: 0,
    width: TAB_W,
    zIndex: 10,
  },
  scrollContent: {
    gap: 2,
    paddingVertical: 4,
  },
  tab: {
    width: TAB_W,
    height: TAB_H,
    backgroundColor: '#F5F2EC',
    borderRightWidth: 1,
    borderColor: '#E8E2D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1E6FD9',
    borderColor: '#1E6FD9',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4A4744',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    // Rotate text to read along the vertical strip
    transform: [{ rotate: '-90deg' }],
    width: TAB_H - 8,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  addBtn: {
    position: 'absolute',
    left: 0,
    width: TAB_W,
    height: TAB_H,
    backgroundColor: '#EBF2FC',
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#C3D9F7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addBtnText: {
    fontSize: 22,
    color: '#1E6FD9',
    fontWeight: '300',
    lineHeight: 26,
  },
  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A2825',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#1E6FD9',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#2A2825',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnConfirmBg: {
    backgroundColor: '#1E6FD9',
  },
  modalBtnCancel: {
    fontSize: 15,
    color: '#8A857C',
    fontWeight: '500',
  },
  modalBtnConfirm: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // ── Action sheet ──
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C0BA',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2825',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E8E2D7',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 14,
  },
  sheetIcon: { fontSize: 20, width: 28 },
  sheetRowText: { fontSize: 16, color: '#2A2825', fontWeight: '500' },
  sheetRowDanger: { color: '#E74C3C' },
  sheetCancel: {
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#E8E2D7',
    justifyContent: 'center',
  },
  sheetCancelText: { fontSize: 16, color: '#8A857C', fontWeight: '600', textAlign: 'center', flex: 1 },
});
