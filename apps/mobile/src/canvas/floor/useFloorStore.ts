import { create } from 'zustand';
import type { Floor, Archetype } from '@bob/shared-schemas';

// ── Default floor heights per archetype ─────────────────────────────────────

const DEFAULT_HEIGHT: Record<Archetype, number> = {
  single_room:  9,
  partial_home: 9,
  full_house:   10,
  mansion:      12,
};

const DEFAULT_LABEL = (index: number): string => {
  if (index === 0) return 'Ground Floor';
  if (index === 1) return 'First Floor';
  if (index === 2) return 'Second Floor';
  if (index === 3) return 'Third Floor';
  return `Floor ${index}`;
};

// ── Store shape ───────────────────────────────────────────────────────────────

export interface FloorState {
  /** Ordered list of floors. Index 0 = ground floor. */
  floors: Floor[];
  /** Index of the currently visible/active floor. */
  activeIndex: number;
  /** Which archetype this design was created with (drives height defaults). */
  archetype: Archetype;

  // Actions
  setFloors: (floors: Floor[]) => void;
  setActiveIndex: (index: number) => void;
  addFloor: () => void;
  removeFloor: (index: number) => void;
  renameFloor: (index: number, label: string) => void;
  reorderFloor: (fromIndex: number, toIndex: number) => void;
  setArchetype: (archetype: Archetype) => void;
  /** Replace the entire floor list with the design's saved state. */
  loadDesign: (floors: Floor[], archetype: Archetype) => void;
}

function makeFloor(index: number, archetype: Archetype): Floor {
  return {
    index,
    label: DEFAULT_LABEL(index),
    heightFt: DEFAULT_HEIGHT[archetype] ?? 10,
    rooms: [],
    stairs: [],
  };
}

export const useFloorStore = create<FloorState>((set, get) => ({
  floors: [makeFloor(0, 'full_house')],
  activeIndex: 0,
  archetype: 'full_house',

  setFloors: (floors) => set({ floors }),

  setActiveIndex: (index) =>
    set((s) => ({
      activeIndex: Math.max(0, Math.min(index, s.floors.length - 1)),
    })),

  addFloor: () =>
    set((s) => {
      const newIndex = s.floors.length;
      return {
        floors: [...s.floors, makeFloor(newIndex, s.archetype)],
        activeIndex: newIndex,
      };
    }),

  removeFloor: (index) =>
    set((s) => {
      if (s.floors.length <= 1) return s; // always keep at least one floor
      const updated = s.floors
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, index: i }));
      const newActive = Math.min(s.activeIndex, updated.length - 1);
      return { floors: updated, activeIndex: newActive };
    }),

  renameFloor: (index, label) =>
    set((s) => ({
      floors: s.floors.map((f, i) => (i === index ? { ...f, label } : f)),
    })),

  reorderFloor: (fromIndex, toIndex) =>
    set((s) => {
      if (fromIndex === toIndex) return s;
      const updated = [...s.floors];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      // Re-stamp indices
      const reindexed = updated.map((f, i) => ({ ...f, index: i }));
      // Track active floor across the reorder
      const activeFloor = s.floors[s.activeIndex];
      const newActive = reindexed.findIndex((f) => f === activeFloor || f.label === activeFloor?.label);
      return {
        floors: reindexed,
        activeIndex: newActive >= 0 ? newActive : s.activeIndex,
      };
    }),

  setArchetype: (archetype) => set({ archetype }),

  loadDesign: (floors, archetype) =>
    set({
      floors: floors.length > 0 ? floors : [makeFloor(0, archetype)],
      activeIndex: 0,
      archetype,
    }),
}));
