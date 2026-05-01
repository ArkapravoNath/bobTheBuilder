import type { CanvasPoint } from '../types';
import type { WallAnchor, WallSide } from './fixtureTypes';
import type { CanvasRoom } from '../room/useRoomStore';

/** How close (canvas units) a drag point must be to snap to a wall. */
export const WALL_SNAP_THRESHOLD = 18;

interface WallSegment {
  wall: WallSide;
  /** Start point of the wall in canvas space. */
  start: CanvasPoint;
  /** End point. */
  end: CanvasPoint;
  /** Unit vector perpendicular to wall, pointing INTO the room. */
  inward: CanvasPoint;
}

/** Extract the 4 wall segments of a rectangular room. */
export function roomWalls(r: { x: number; y: number; w: number; h: number }): WallSegment[] {
  return [
    // North (top) — interior is below (positive Y)
    { wall: 'N', start: { x: r.x,       y: r.y       }, end: { x: r.x + r.w, y: r.y       }, inward: { x: 0,  y: 1  } },
    // South (bottom) — interior is above (negative Y)
    { wall: 'S', start: { x: r.x,       y: r.y + r.h }, end: { x: r.x + r.w, y: r.y + r.h }, inward: { x: 0,  y: -1 } },
    // West (left) — interior is right (positive X)
    { wall: 'W', start: { x: r.x,       y: r.y       }, end: { x: r.x,       y: r.y + r.h }, inward: { x: 1,  y: 0  } },
    // East (right) — interior is left (negative X)
    { wall: 'E', start: { x: r.x + r.w, y: r.y       }, end: { x: r.x + r.w, y: r.y + r.h }, inward: { x: -1, y: 0  } },
  ];
}

/**
 * Distance from point P to line segment (A → B).
 * Returns { distance, t } where t ∈ [0,1] is the normalized position along AB.
 */
function distToSegment(
  p: CanvasPoint,
  a: CanvasPoint,
  b: CanvasPoint,
): { distance: number; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { distance: Math.hypot(p.x - a.x, p.y - a.y), t: 0 };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const nearX = a.x + t * dx;
  const nearY = a.y + t * dy;
  return { distance: Math.hypot(p.x - nearX, p.y - nearY), t };
}

/**
 * Given a canvas drag point, find the nearest room wall within WALL_SNAP_THRESHOLD.
 * Returns a WallAnchor if snapping applies, otherwise null.
 */
export function snapToWall(
  dragPoint: CanvasPoint,
  rooms: Array<{ id: string; x: number; y: number; w: number; h: number; floorIndex: number }>,
  activeFloorIndex: number,
): WallAnchor | null {
  let best: { dist: number; anchor: WallAnchor } | null = null;

  for (const room of rooms) {
    if (room.floorIndex !== activeFloorIndex) continue;

    for (const seg of roomWalls(room)) {
      const { distance, t } = distToSegment(dragPoint, seg.start, seg.end);

      if (distance > WALL_SNAP_THRESHOLD) continue;

      // Determine if the drag point is on the interior side of the wall
      const midX = seg.start.x + t * (seg.end.x - seg.start.x);
      const midY = seg.start.y + t * (seg.end.y - seg.start.y);
      const dotInward = (dragPoint.x - midX) * seg.inward.x + (dragPoint.y - midY) * seg.inward.y;
      const openInward = dotInward <= 0; // user dragged from outside → opens inward

      if (!best || distance < best.dist) {
        best = {
          dist: distance,
          anchor: {
            roomId: room.id,
            wall: seg.wall,
            positionAlongWall: t,
            openInward,
          },
        };
      }
    }
  }

  return best?.anchor ?? null;
}

/**
 * Convert a wall anchor back to a canvas-space position and orientation angle.
 * angle: 0° = door faces North, 90° = East, 180° = South, 270° = West
 */
export function anchorToCanvasPos(
  anchor: WallAnchor,
  room: { x: number; y: number; w: number; h: number },
): { x: number; y: number; angleDeg: number } {
  const walls = roomWalls(room);
  const seg = walls.find((w) => w.wall === anchor.wall)!;
  const t = anchor.positionAlongWall;
  const x = seg.start.x + t * (seg.end.x - seg.start.x);
  const y = seg.start.y + t * (seg.end.y - seg.start.y);

  const angleMap: Record<WallSide, number> = { N: 0, E: 90, S: 180, W: 270 };
  return { x, y, angleDeg: angleMap[anchor.wall] };
}
