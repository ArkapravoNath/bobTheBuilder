import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';
import type {
  CanvasFixture, FixtureKind, FixtureSpec, WallAnchor,
  DoorSpec, WindowSpec, StairSpec,
} from './fixtureTypes';
import { DEFAULT_DOOR, DEFAULT_WINDOW, DEFAULT_STAIR } from './fixtureTypes';

interface FixtureStore {
  fixtures: CanvasFixture[];
  selectedId: string | null;
  /** Which fixture type the tray currently has active (null = select mode). */
  activeTool: FixtureKind | null;

  // Placement
  addFixture: (kind: FixtureKind, anchor: WallAnchor, floorIndex: number) => string;
  commitAnchor: (id: string, anchor: WallAnchor) => void;
  removeFixture: (id: string) => void;
  selectFixture: (id: string | null) => void;

  // Spec editing
  updateSpec: (id: string, patch: Partial<DoorSpec> | Partial<WindowSpec> | Partial<StairSpec>) => void;

  // Tool
  setActiveTool: (kind: FixtureKind | null) => void;

  // Floor
  setFixtures: (fixtures: CanvasFixture[]) => void;
}

function defaultSpec(kind: FixtureKind): FixtureSpec {
  if (kind === 'door')   return { ...DEFAULT_DOOR };
  if (kind === 'window') return { ...DEFAULT_WINDOW };
  return { ...DEFAULT_STAIR };
}

function updateFixtureSpec(
  fixture: CanvasFixture,
  patch: Partial<DoorSpec> | Partial<WindowSpec> | Partial<StairSpec>,
): CanvasFixture {
  if (fixture.kind === 'door') {
    return { ...fixture, spec: { ...(fixture.spec as DoorSpec), ...(patch as Partial<DoorSpec>) } };
  }
  if (fixture.kind === 'window') {
    return { ...fixture, spec: { ...(fixture.spec as WindowSpec), ...(patch as Partial<WindowSpec>) } };
  }
  return { ...fixture, spec: { ...(fixture.spec as StairSpec), ...(patch as Partial<StairSpec>) } };
}

export const useFixtureStore = create<FixtureStore>((set) => ({
  fixtures: [],
  selectedId: null,
  activeTool: null,

  addFixture: (kind, anchor, floorIndex) => {
    const id = randomUUID();
    set((s) => ({
      fixtures: [
        ...s.fixtures,
        { id, kind, spec: defaultSpec(kind), anchor, floorIndex },
      ],
      selectedId: id,
    }));
    return id;
  },

  commitAnchor: (id, anchor) =>
    set((s) => ({
      fixtures: s.fixtures.map((f) => (f.id === id ? { ...f, anchor } : f)),
    })),

  removeFixture: (id) =>
    set((s) => ({
      fixtures: s.fixtures.filter((f) => f.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  selectFixture: (id) => set({ selectedId: id }),

  updateSpec: (id, patch) =>
    set((s) => ({
      fixtures: s.fixtures.map((f) =>
        f.id === id ? updateFixtureSpec(f, patch) : f,
      ),
    })),

  setActiveTool: (kind) => set({ activeTool: kind, selectedId: null }),

  setFixtures: (fixtures) => set({ fixtures }),
}));
