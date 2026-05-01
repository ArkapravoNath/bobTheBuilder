/** @jest-environment node */
import { roomWalls, snapToWall, anchorToCanvasPos, WALL_SNAP_THRESHOLD } from '../fixture/wallSnap';

// ── roomWalls ─────────────────────────────────────────────────────────────────

describe('roomWalls', () => {
  const r = { x: 100, y: 200, w: 120, h: 80 };

  test('returns 4 walls', () => {
    expect(roomWalls(r)).toHaveLength(4);
  });

  test('North wall runs along top edge', () => {
    const n = roomWalls(r).find((w) => w.wall === 'N')!;
    expect(n.start).toEqual({ x: 100, y: 200 });
    expect(n.end).toEqual({ x: 220, y: 200 });
    expect(n.inward).toEqual({ x: 0, y: 1 });
  });

  test('South wall runs along bottom edge with inward pointing up', () => {
    const s = roomWalls(r).find((w) => w.wall === 'S')!;
    expect(s.start).toEqual({ x: 100, y: 280 });
    expect(s.end).toEqual({ x: 220, y: 280 });
    expect(s.inward).toEqual({ x: 0, y: -1 });
  });

  test('West wall runs along left edge with inward pointing right', () => {
    const w = roomWalls(r).find((w) => w.wall === 'W')!;
    expect(w.start).toEqual({ x: 100, y: 200 });
    expect(w.end).toEqual({ x: 100, y: 280 });
    expect(w.inward).toEqual({ x: 1, y: 0 });
  });

  test('East wall runs along right edge with inward pointing left', () => {
    const e = roomWalls(r).find((w) => w.wall === 'E')!;
    expect(e.start).toEqual({ x: 220, y: 200 });
    expect(e.end).toEqual({ x: 220, y: 280 });
    expect(e.inward).toEqual({ x: -1, y: 0 });
  });
});

// ── snapToWall ────────────────────────────────────────────────────────────────

const room = { id: 'r1', x: 0, y: 0, w: 120, h: 80, floorIndex: 0 };

describe('snapToWall', () => {
  test('returns null when point is too far from any wall', () => {
    const result = snapToWall({ x: 60, y: 40 }, [room], 0);
    expect(result).toBeNull();
  });

  test('snaps to North wall from outside (above)', () => {
    const result = snapToWall({ x: 60, y: -10 }, [room], 0);
    expect(result).not.toBeNull();
    expect(result!.wall).toBe('N');
    expect(result!.roomId).toBe('r1');
  });

  test('snaps to South wall from outside (below)', () => {
    const result = snapToWall({ x: 60, y: 90 }, [room], 0);
    expect(result).not.toBeNull();
    expect(result!.wall).toBe('S');
  });

  test('snaps to West wall from outside (left)', () => {
    const result = snapToWall({ x: -10, y: 40 }, [room], 0);
    expect(result).not.toBeNull();
    expect(result!.wall).toBe('W');
  });

  test('snaps to East wall from outside (right)', () => {
    const result = snapToWall({ x: 130, y: 40 }, [room], 0);
    expect(result).not.toBeNull();
    expect(result!.wall).toBe('E');
  });

  test('positionAlongWall is 0.5 for midpoint of North wall', () => {
    const result = snapToWall({ x: 60, y: -5 }, [room], 0);
    expect(result!.positionAlongWall).toBeCloseTo(0.5, 2);
  });

  test('positionAlongWall is near 0 for left end of North wall', () => {
    const result = snapToWall({ x: 2, y: -5 }, [room], 0);
    expect(result!.positionAlongWall).toBeCloseTo(2 / 120, 2);
  });

  test('ignores rooms on different floor', () => {
    const result = snapToWall({ x: 60, y: -5 }, [room], 1);
    expect(result).toBeNull();
  });

  test('openInward is true when dragging from outside', () => {
    const result = snapToWall({ x: 60, y: -5 }, [room], 0);
    expect(result!.openInward).toBe(true);
  });

  test('openInward is false when dragging from inside', () => {
    const result = snapToWall({ x: 60, y: 5 }, [room], 0);
    expect(result).not.toBeNull();
    expect(result!.openInward).toBe(false);
  });

  test('picks nearest wall when two walls are equidistant', () => {
    // Square room, corner point — should snap to one of the two walls
    const squareRoom = { id: 'sq', x: 0, y: 0, w: 100, h: 100, floorIndex: 0 };
    const result = snapToWall({ x: -8, y: -8 }, [squareRoom], 0);
    expect(result).not.toBeNull();
    expect(['N', 'W']).toContain(result!.wall);
  });
});

// ── anchorToCanvasPos ─────────────────────────────────────────────────────────

describe('anchorToCanvasPos', () => {
  const r = { x: 0, y: 0, w: 120, h: 80 };

  test('midpoint of North wall, angleDeg=0', () => {
    const { x, y, angleDeg } = anchorToCanvasPos(
      { roomId: 'r', wall: 'N', positionAlongWall: 0.5, openInward: true },
      r,
    );
    expect(x).toBeCloseTo(60);
    expect(y).toBeCloseTo(0);
    expect(angleDeg).toBe(0);
  });

  test('midpoint of South wall, angleDeg=180', () => {
    const { x, y, angleDeg } = anchorToCanvasPos(
      { roomId: 'r', wall: 'S', positionAlongWall: 0.5, openInward: true },
      r,
    );
    expect(x).toBeCloseTo(60);
    expect(y).toBeCloseTo(80);
    expect(angleDeg).toBe(180);
  });

  test('midpoint of West wall, angleDeg=270', () => {
    const { x, y, angleDeg } = anchorToCanvasPos(
      { roomId: 'r', wall: 'W', positionAlongWall: 0.5, openInward: true },
      r,
    );
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(40);
    expect(angleDeg).toBe(270);
  });

  test('midpoint of East wall, angleDeg=90', () => {
    const { x, y, angleDeg } = anchorToCanvasPos(
      { roomId: 'r', wall: 'E', positionAlongWall: 0.5, openInward: true },
      r,
    );
    expect(x).toBeCloseTo(120);
    expect(y).toBeCloseTo(40);
    expect(angleDeg).toBe(90);
  });

  test('positionAlongWall=0 gives wall start', () => {
    const { x, y } = anchorToCanvasPos(
      { roomId: 'r', wall: 'N', positionAlongWall: 0, openInward: true },
      r,
    );
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
  });

  test('positionAlongWall=1 gives wall end', () => {
    const { x, y } = anchorToCanvasPos(
      { roomId: 'r', wall: 'N', positionAlongWall: 1, openInward: true },
      r,
    );
    expect(x).toBeCloseTo(120);
    expect(y).toBeCloseTo(0);
  });
});

// ── WALL_SNAP_THRESHOLD ───────────────────────────────────────────────────────

describe('WALL_SNAP_THRESHOLD', () => {
  test('is 18 canvas units', () => {
    expect(WALL_SNAP_THRESHOLD).toBe(18);
  });

  test('point exactly at threshold distance from North wall snaps', () => {
    const r = { id: 'r', x: 0, y: 0, w: 120, h: 80, floorIndex: 0 };
    // North wall is at y=0; point at y = -WALL_SNAP_THRESHOLD should still snap
    const result = snapToWall({ x: 60, y: -WALL_SNAP_THRESHOLD }, [r], 0);
    expect(result).not.toBeNull();
  });

  test('point just beyond threshold does NOT snap', () => {
    const r = { id: 'r', x: 0, y: 0, w: 120, h: 80, floorIndex: 0 };
    const result = snapToWall({ x: 60, y: -(WALL_SNAP_THRESHOLD + 1) }, [r], 0);
    expect(result).toBeNull();
  });
});
