/** @jest-environment node */
/**
 * Pure logic tests for useFloorStore actions.
 * We test the reducer functions directly without React rendering.
 */
import { useFloorStore } from '../floor/useFloorStore';

// Reset store to a known initial state before each test
beforeEach(() => {
  useFloorStore.setState({
    floors: [
      { index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] },
    ],
    activeIndex: 0,
    archetype: 'full_house',
  });
});

describe('addFloor', () => {
  it('appends a new floor and activates it', () => {
    useFloorStore.getState().addFloor();
    const { floors, activeIndex } = useFloorStore.getState();
    expect(floors).toHaveLength(2);
    expect(activeIndex).toBe(1);
    expect(floors[1].index).toBe(1);
    expect(floors[1].label).toBe('First Floor');
  });

  it('uses archetype height defaults', () => {
    useFloorStore.setState({ archetype: 'mansion' });
    useFloorStore.getState().addFloor();
    const { floors } = useFloorStore.getState();
    expect(floors[1].heightFt).toBe(12);
  });

  it('can add up to many floors', () => {
    for (let i = 0; i < 5; i++) useFloorStore.getState().addFloor();
    expect(useFloorStore.getState().floors).toHaveLength(6);
  });
});

describe('removeFloor', () => {
  it('removes the specified floor', () => {
    useFloorStore.getState().addFloor();
    useFloorStore.getState().addFloor();
    useFloorStore.getState().removeFloor(1);
    const { floors } = useFloorStore.getState();
    expect(floors).toHaveLength(2);
    expect(floors[0].label).toBe('Ground Floor');
    expect(floors[1].label).toBe('Second Floor'); // was index 2, now 1
    expect(floors[1].index).toBe(1);
  });

  it('does nothing when only one floor remains', () => {
    useFloorStore.getState().removeFloor(0);
    expect(useFloorStore.getState().floors).toHaveLength(1);
  });

  it('clamps activeIndex after removal', () => {
    useFloorStore.getState().addFloor();
    useFloorStore.getState().setActiveIndex(1);
    useFloorStore.getState().removeFloor(1);
    expect(useFloorStore.getState().activeIndex).toBe(0);
  });
});

describe('renameFloor', () => {
  it('updates the label', () => {
    useFloorStore.getState().renameFloor(0, 'Basement');
    expect(useFloorStore.getState().floors[0].label).toBe('Basement');
  });

  it('does not affect other floors', () => {
    useFloorStore.getState().addFloor();
    useFloorStore.getState().renameFloor(0, 'Basement');
    expect(useFloorStore.getState().floors[1].label).toBe('First Floor');
  });
});

describe('reorderFloor', () => {
  beforeEach(() => {
    useFloorStore.getState().addFloor(); // Floor 1
    useFloorStore.getState().addFloor(); // Floor 2
    // floors: [0:Ground, 1:First, 2:Second]
  });

  it('moves a floor up', () => {
    useFloorStore.getState().reorderFloor(0, 1);
    const { floors } = useFloorStore.getState();
    expect(floors[0].label).toBe('First Floor');
    expect(floors[1].label).toBe('Ground Floor');
    // Indices re-stamped
    expect(floors[0].index).toBe(0);
    expect(floors[1].index).toBe(1);
  });

  it('moves a floor down', () => {
    useFloorStore.getState().reorderFloor(2, 0);
    const { floors } = useFloorStore.getState();
    expect(floors[0].label).toBe('Second Floor');
    expect(floors[1].label).toBe('Ground Floor');
  });

  it('is a no-op when from === to', () => {
    const before = useFloorStore.getState().floors.map((f) => f.label);
    useFloorStore.getState().reorderFloor(1, 1);
    const after = useFloorStore.getState().floors.map((f) => f.label);
    expect(after).toEqual(before);
  });
});

describe('setActiveIndex', () => {
  it('clamps to valid range', () => {
    useFloorStore.getState().setActiveIndex(999);
    expect(useFloorStore.getState().activeIndex).toBe(0); // only 1 floor
    useFloorStore.getState().setActiveIndex(-5);
    expect(useFloorStore.getState().activeIndex).toBe(0);
  });
});

describe('loadDesign', () => {
  it('replaces floors and resets active index', () => {
    const savedFloors = [
      { index: 0, label: 'Custom GF', heightFt: 9, rooms: [], stairs: [] },
      { index: 1, label: 'Custom F1', heightFt: 9, rooms: [], stairs: [] },
    ];
    useFloorStore.getState().loadDesign(savedFloors, 'partial_home');
    const { floors, activeIndex, archetype } = useFloorStore.getState();
    expect(floors).toHaveLength(2);
    expect(floors[0].label).toBe('Custom GF');
    expect(activeIndex).toBe(0);
    expect(archetype).toBe('partial_home');
  });

  it('creates a default floor if array is empty', () => {
    useFloorStore.getState().loadDesign([], 'mansion');
    expect(useFloorStore.getState().floors).toHaveLength(1);
    expect(useFloorStore.getState().floors[0].heightFt).toBe(12);
  });
});
