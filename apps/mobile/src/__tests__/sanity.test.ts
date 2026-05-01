/** @jest-environment node */
/**
 * Sanity tests — catch import errors and regressions in shared logic.
 *
 * All tests run in a pure Node environment; no React Native runtime required.
 * Covers: module resolution, canvas constants, store initial state, estimate
 * math, formatCurrency, and fixture defaults.
 */

// ── 1. Module resolution ──────────────────────────────────────────────────────
// Each test ensures the module can be required without throwing. A failure here
// means a broken import path, a missing dependency, or a bad re-export.

describe('Module resolution', () => {
  it('canvas/viewport resolves', () => {
    expect(() => require('../canvas/viewport')).not.toThrow();
  });

  it('canvas/constants resolves', () => {
    expect(() => require('../canvas/constants')).not.toThrow();
  });

  it('canvas/fixture/wallSnap resolves', () => {
    expect(() => require('../canvas/fixture/wallSnap')).not.toThrow();
  });

  it('canvas/fixture/fixtureTypes resolves', () => {
    expect(() => require('../canvas/fixture/fixtureTypes')).not.toThrow();
  });

  it('utils/formatCurrency resolves', () => {
    expect(() => require('../utils/formatCurrency')).not.toThrow();
  });

  it('canvas/floor/useFloorStore resolves', () => {
    expect(() => require('../canvas/floor/useFloorStore')).not.toThrow();
  });
});

// ── 2. Canvas constants ───────────────────────────────────────────────────────

describe('Canvas constants', () => {
  const c = require('../canvas/constants');

  it('SNAP_GRID_IN is a positive integer', () => {
    expect(c.SNAP_GRID_IN).toBeGreaterThan(0);
    expect(Number.isInteger(c.SNAP_GRID_IN)).toBe(true);
  });

  it('MIN_SCALE < 1 and MAX_SCALE > 1', () => {
    expect(c.MIN_SCALE).toBeLessThan(1);
    expect(c.MAX_SCALE).toBeGreaterThan(1);
  });

  it('DEFAULT_SCALE is within [MIN_SCALE, MAX_SCALE]', () => {
    expect(c.DEFAULT_SCALE).toBeGreaterThanOrEqual(c.MIN_SCALE);
    expect(c.DEFAULT_SCALE).toBeLessThanOrEqual(c.MAX_SCALE);
  });

  it('RULER_SIZE is a positive number', () => {
    expect(c.RULER_SIZE).toBeGreaterThan(0);
  });

  it('FRAME_BUDGET_MS targets ≥ 55 fps', () => {
    // 1000/55 has floating-point representation; use round to compare exactly
    expect(Math.round(1000 / c.FRAME_BUDGET_MS)).toBeGreaterThanOrEqual(55);
  });
});

// ── 3. Floor store — initial state and action contracts ───────────────────────

describe('Floor store', () => {
  const { useFloorStore } = require('../canvas/floor/useFloorStore');

  beforeEach(() => {
    useFloorStore.setState({
      floors: [{ index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] }],
      activeIndex: 0,
      archetype: 'full_house',
    });
  });

  it('initial state has correct shape', () => {
    const { floors, activeIndex, archetype } = useFloorStore.getState();
    expect(Array.isArray(floors)).toBe(true);
    expect(typeof activeIndex).toBe('number');
    expect(typeof archetype).toBe('string');
  });

  it('state exposes all required actions', () => {
    const state = useFloorStore.getState();
    const actions = [
      'setFloors', 'setActiveIndex', 'addFloor', 'removeFloor',
      'renameFloor', 'reorderFloor', 'setArchetype', 'loadDesign',
    ];
    actions.forEach((fn) => expect(typeof (state as Record<string, unknown>)[fn]).toBe('function'));
  });

  it('addFloor increments floor count and activates new floor', () => {
    useFloorStore.getState().addFloor();
    const { floors, activeIndex } = useFloorStore.getState();
    expect(floors).toHaveLength(2);
    expect(activeIndex).toBe(1);
  });

  it('removeFloor never drops below 1 floor', () => {
    useFloorStore.getState().removeFloor(0);
    expect(useFloorStore.getState().floors.length).toBeGreaterThanOrEqual(1);
  });

  it('setActiveIndex clamps to valid range', () => {
    useFloorStore.getState().setActiveIndex(999);
    expect(useFloorStore.getState().activeIndex).toBe(0);
    useFloorStore.getState().setActiveIndex(-1);
    expect(useFloorStore.getState().activeIndex).toBe(0);
  });

  it('loadDesign replaces floors and resets activeIndex', () => {
    useFloorStore.getState().addFloor();
    useFloorStore.getState().loadDesign(
      [{ index: 0, label: 'B', heightFt: 9, rooms: [], stairs: [] }],
      'single_room',
    );
    const { floors, activeIndex, archetype } = useFloorStore.getState();
    expect(floors).toHaveLength(1);
    expect(floors[0].label).toBe('B');
    expect(activeIndex).toBe(0);
    expect(archetype).toBe('single_room');
  });

  it('loadDesign with empty array creates one default floor', () => {
    useFloorStore.getState().loadDesign([], 'mansion');
    expect(useFloorStore.getState().floors).toHaveLength(1);
  });

  it('renameFloor updates label without touching other floors', () => {
    useFloorStore.getState().addFloor();
    useFloorStore.getState().renameFloor(0, 'Basement');
    const { floors } = useFloorStore.getState();
    expect(floors[0].label).toBe('Basement');
    expect(floors[1].label).not.toBe('Basement');
  });

  it('each floor has the mandatory schema fields', () => {
    useFloorStore.getState().addFloor();
    useFloorStore.getState().getState;
    const { floors } = useFloorStore.getState();
    floors.forEach((f: { index: unknown; label: unknown; heightFt: unknown; rooms: unknown; stairs: unknown }) => {
      expect(typeof f.index).toBe('number');
      expect(typeof f.label).toBe('string');
      expect(typeof f.heightFt).toBe('number');
      expect(Array.isArray(f.rooms)).toBe(true);
      expect(Array.isArray(f.stairs)).toBe(true);
    });
  });
});

// ── 4. Estimate math ──────────────────────────────────────────────────────────
// Canvas units are inches; area = (w * h) / 144 gives sqft.
// Cost model: ₹1800/sqft (material + labour).

describe('Estimate calculation', () => {
  const RATE = 1800;

  function estimate(widthIn: number, heightIn: number): number {
    return (widthIn * heightIn) / 144 * RATE;
  }

  it('12 ft × 12 ft room → 144 sqft → ₹2,59,200', () => {
    expect(estimate(144, 144)).toBe(259200);
  });

  it('6 ft × 8 ft room → 48 sqft → ₹86,400', () => {
    expect(estimate(72, 96)).toBe(86400);
  });

  it('doubling both dimensions quadruples the cost', () => {
    expect(estimate(100, 100) * 4).toBeCloseTo(estimate(200, 200));
  });

  it('zero-area room costs ₹0', () => {
    expect(estimate(0, 144)).toBe(0);
  });

  it('multi-room total sums correctly', () => {
    const rooms = [
      { w: 144, h: 144 }, // 144 sqft
      { w: 72,  h: 96  }, // 48 sqft
      { w: 60,  h: 60  }, // 25 sqft
    ];
    const total = rooms.reduce((acc, r) => acc + estimate(r.w, r.h), 0);
    const expected = (144 + 48 + 25) * RATE;
    expect(total).toBeCloseTo(expected);
  });
});

// ── 5. formatCurrency ────────────────────────────────────────────────────────

describe('formatCurrency — estimate-range values', () => {
  const { formatINR, fullINR } = require('../utils/formatCurrency');

  it('₹0 formats to "₹0"', () => {
    expect(formatINR(0)).toBe('₹0');
  });

  it('values < 1L show comma-separated integer', () => {
    expect(formatINR(86400)).toBe('₹86,400');
  });

  it('1L exactly shows "₹1L"', () => {
    expect(formatINR(100000)).toBe('₹1L');
  });

  it('2.5L shows "₹2.5L"', () => {
    expect(formatINR(250000)).toBe('₹2.5L');
  });

  it('1Cr exactly shows "₹1Cr"', () => {
    expect(formatINR(10000000)).toBe('₹1Cr');
  });

  it('negative values are prefixed with minus', () => {
    expect(formatINR(-100000)).toBe('-₹1L');
  });

  it('fullINR uses Indian grouping', () => {
    expect(fullINR(259200)).toBe('₹2,59,200');
    expect(fullINR(1000000)).toBe('₹10,00,000');
  });
});

// ── 6. Fixture defaults ───────────────────────────────────────────────────────

describe('Fixture defaults', () => {
  const { DEFAULT_DOOR, DEFAULT_WINDOW, DEFAULT_STAIR, TRAY_ITEMS } =
    require('../canvas/fixture/fixtureTypes');

  it('DEFAULT_DOOR has a positive widthIn', () => {
    expect(typeof DEFAULT_DOOR.widthIn).toBe('number');
    expect(DEFAULT_DOOR.widthIn).toBeGreaterThan(0);
  });

  it('DEFAULT_WINDOW has positive widthIn and heightIn', () => {
    expect(DEFAULT_WINDOW.widthIn).toBeGreaterThan(0);
    expect(DEFAULT_WINDOW.heightIn).toBeGreaterThan(0);
  });

  it('DEFAULT_STAIR has positive widthIn and riserCount', () => {
    expect(DEFAULT_STAIR.widthIn).toBeGreaterThan(0);
    expect(DEFAULT_STAIR.riserCount).toBeGreaterThan(0);
  });

  it('TRAY_ITEMS has exactly 3 entries (door, window, stairs)', () => {
    expect(TRAY_ITEMS).toHaveLength(3);
    const kinds = TRAY_ITEMS.map((t: { kind: string }) => t.kind);
    expect(kinds).toContain('door');
    expect(kinds).toContain('window');
    expect(kinds).toContain('stairs');
  });

  it('each TRAY_ITEM has label, icon, and defaultSpec', () => {
    TRAY_ITEMS.forEach((item: { label: unknown; icon: unknown; defaultSpec: unknown }) => {
      expect(typeof item.label).toBe('string');
      expect(typeof item.icon).toBe('string');
      expect(typeof item.defaultSpec).toBe('object');
    });
  });
});

// ── 7. Wall snap — integration sanity ────────────────────────────────────────

describe('Wall snap — sanity', () => {
  const { snapToWall, WALL_SNAP_THRESHOLD } = require('../canvas/fixture/wallSnap');
  const room = { id: 'r1', x: 0, y: 0, w: 120, h: 80, floorIndex: 0 };

  it('WALL_SNAP_THRESHOLD is a positive number', () => {
    expect(WALL_SNAP_THRESHOLD).toBeGreaterThan(0);
  });

  it('point well inside the room does not snap', () => {
    expect(snapToWall({ x: 60, y: 40 }, [room], 0)).toBeNull();
  });

  it('point near North wall snaps and returns roomId', () => {
    const result = snapToWall({ x: 60, y: -5 }, [room], 0);
    expect(result).not.toBeNull();
    expect(result!.roomId).toBe('r1');
    expect(result!.wall).toBe('N');
  });

  it('point on a different floorIndex does not snap', () => {
    expect(snapToWall({ x: 60, y: -5 }, [room], 1)).toBeNull();
  });
});

// ── 8. Viewport — round-trip sanity ──────────────────────────────────────────

describe('Viewport — round-trip sanity', () => {
  const { canvasToScreen, screenToCanvas } = require('../canvas/viewport');

  it('screenToCanvas is the inverse of canvasToScreen', () => {
    const vp = { tx: 36, ty: 36, scale: 0.6 };
    const original = { x: 200, y: 300 };
    const screen = canvasToScreen(original, vp);
    const back   = screenToCanvas(screen, vp);
    expect(back.x).toBeCloseTo(original.x);
    expect(back.y).toBeCloseTo(original.y);
  });

  it('scale=1 maps canvas origin to (tx, ty)', () => {
    const vp = { tx: 50, ty: 80, scale: 1 };
    const s = canvasToScreen({ x: 0, y: 0 }, vp);
    expect(s.x).toBe(50);
    expect(s.y).toBe(80);
  });
});
