import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';
import type { Room, RoomType } from '@bob/shared-schemas';
import { snapToGrid } from '../viewport';
import { SNAP_GRID_IN } from '../constants';
import { MIN_ROOM_W, MIN_ROOM_H } from './roomColors';

export interface CanvasRoom extends Room {
  /** Flat rect representation for the canvas (more ergonomic than polygon for rectangles). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Floor index this room belongs to. */
  floorIndex: number;
  /** Whether this room overlaps another (collision flag). */
  hasCollision?: boolean;
}

interface RoomStore {
  rooms: CanvasRoom[];
  selectedId: string | null;

  addRoom: (x: number, y: number, w: number, h: number, floorIndex: number) => string;
  moveRoom: (id: string, dx: number, dy: number) => void;
  resizeRoom: (id: string, dw: number, dh: number, anchor: ResizeAnchor) => void;
  setRoomType: (id: string, type: RoomType) => void;
  deleteRoom: (id: string) => void;
  selectRoom: (id: string | null) => void;
  setRooms: (rooms: CanvasRoom[]) => void;
  detectCollisions: () => void;
  commitMove: (id: string, x: number, y: number) => void;
  commitResize: (id: string, x: number, y: number, w: number, h: number) => void;
}

export type ResizeAnchor = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

function rectsOverlap(a: CanvasRoom, b: CanvasRoom): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function roomToPolygon(r: CanvasRoom): Room['polygon'] {
  return [
    { x: r.x,       y: r.y       },
    { x: r.x + r.w, y: r.y       },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x,       y: r.y + r.h },
  ];
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: [],
  selectedId: null,

  addRoom: (x, y, w, h, floorIndex) => {
    const id = randomUUID();
    const snappedX = snapToGrid(x, SNAP_GRID_IN);
    const snappedY = snapToGrid(y, SNAP_GRID_IN);
    const snappedW = Math.max(MIN_ROOM_W, snapToGrid(w, SNAP_GRID_IN));
    const snappedH = Math.max(MIN_ROOM_H, snapToGrid(h, SNAP_GRID_IN));

    const newRoom: CanvasRoom = {
      id,
      type: 'living',
      polygon: roomToPolygon({ x: snappedX, y: snappedY, w: snappedW, h: snappedH } as CanvasRoom),
      ceilingHeight: 10,
      finishes: {},
      fixtures: [],
      x: snappedX,
      y: snappedY,
      w: snappedW,
      h: snappedH,
      floorIndex,
    };

    set((s) => ({ rooms: [...s.rooms, newRoom], selectedId: id }));
    get().detectCollisions();
    return id;
  },

  commitMove: (id, x, y) => {
    const sx = snapToGrid(x, SNAP_GRID_IN);
    const sy = snapToGrid(y, SNAP_GRID_IN);
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id ? { ...r, x: sx, y: sy, polygon: roomToPolygon({ ...r, x: sx, y: sy }) } : r,
      ),
    }));
    get().detectCollisions();
  },

  moveRoom: (id, dx, dy) => {
    set((s) => ({
      rooms: s.rooms.map((r) => {
        if (r.id !== id) return r;
        return { ...r, x: r.x + dx, y: r.y + dy };
      }),
    }));
  },

  commitResize: (id, x, y, w, h) => {
    const sx = snapToGrid(x, SNAP_GRID_IN);
    const sy = snapToGrid(y, SNAP_GRID_IN);
    const sw = Math.max(MIN_ROOM_W, snapToGrid(w, SNAP_GRID_IN));
    const sh = Math.max(MIN_ROOM_H, snapToGrid(h, SNAP_GRID_IN));
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id
          ? { ...r, x: sx, y: sy, w: sw, h: sh, polygon: roomToPolygon({ ...r, x: sx, y: sy, w: sw, h: sh }) }
          : r,
      ),
    }));
    get().detectCollisions();
  },

  resizeRoom: (id, dw, dh, anchor) => {
    set((s) => ({
      rooms: s.rooms.map((r) => {
        if (r.id !== id) return r;
        let { x, y, w, h } = r;
        if (anchor.includes('e')) w = Math.max(MIN_ROOM_W, w + dw);
        if (anchor.includes('s')) h = Math.max(MIN_ROOM_H, h + dh);
        if (anchor.includes('w')) { const nw = Math.max(MIN_ROOM_W, w - dw); x += w - nw; w = nw; }
        if (anchor.includes('n')) { const nh = Math.max(MIN_ROOM_H, h - dh); y += h - nh; h = nh; }
        return { ...r, x, y, w, h };
      }),
    }));
  },

  setRoomType: (id, type) => {
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, type } : r)),
    }));
  },

  deleteRoom: (id) => {
    set((s) => ({
      rooms: s.rooms.filter((r) => r.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
    get().detectCollisions();
  },

  selectRoom: (id) => set({ selectedId: id }),

  setRooms: (rooms) => set({ rooms }),

  detectCollisions: () => {
    const { rooms } = get();
    const updated = rooms.map((r) => ({
      ...r,
      hasCollision: rooms.some((other) => other.id !== r.id && other.floorIndex === r.floorIndex && rectsOverlap(r, other)),
    }));
    set({ rooms: updated });
  },
}));
