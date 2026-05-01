export type WallSide = 'N' | 'E' | 'S' | 'W';

export type DoorStyle    = 'swing' | 'sliding' | 'double';
export type WindowStyle  = 'casement' | 'bay' | 'french';
export type GlazingType  = 'single' | 'double' | 'tinted';
export type StairDirection = 'N' | 'E' | 'S' | 'W';
export type FixtureKind  = 'door' | 'window' | 'stairs';

/** Wall anchor: normalized position (0=start, 1=end) along a room wall. */
export interface WallAnchor {
  roomId: string;
  wall: WallSide;
  /** 0.0 = wall start, 1.0 = wall end (normalized so it survives room resize). */
  positionAlongWall: number;
  /** Which side of the wall the fixture opens toward (1 = into room, -1 = outward). */
  openInward: boolean;
}

export interface DoorSpec {
  style: DoorStyle;
  /** Width in canvas units (inches). Default 36". */
  widthIn: number;
  material: 'teak' | 'aluminium' | 'upvc';
}

export interface WindowSpec {
  style: WindowStyle;
  /** Width in canvas units (inches). Default 48". */
  widthIn: number;
  /** Height in canvas units. Default 48". */
  heightIn: number;
  glazing: GlazingType;
  panes: 2 | 3;
}

export interface StairSpec {
  direction: StairDirection;
  /** Width of stair flight in canvas units. Default 48". */
  widthIn: number;
  /** Total run (depth) in canvas units. Default 120". = 10 ft. */
  runIn: number;
  riserCount: number;
}

export type FixtureSpec = DoorSpec | WindowSpec | StairSpec;

export interface CanvasFixture {
  id: string;
  kind: FixtureKind;
  spec: FixtureSpec;
  /** Wall anchor — null means fixture is free-floating (being dragged). */
  anchor: WallAnchor | null;
  floorIndex: number;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_DOOR: DoorSpec = {
  style: 'swing',
  widthIn: 36,
  material: 'teak',
};

export const DEFAULT_WINDOW: WindowSpec = {
  style: 'casement',
  widthIn: 48,
  heightIn: 48,
  glazing: 'double',
  panes: 2,
};

export const DEFAULT_STAIR: StairSpec = {
  direction: 'N',
  widthIn: 48,
  runIn: 120,
  riserCount: 10,
};

// ── Tray items ────────────────────────────────────────────────────────────────

export interface TrayItem {
  kind: FixtureKind;
  label: string;
  icon: string;
  defaultSpec: FixtureSpec;
}

export const TRAY_ITEMS: TrayItem[] = [
  { kind: 'door',    label: 'Door',    icon: '🚪', defaultSpec: DEFAULT_DOOR   },
  { kind: 'window',  label: 'Window',  icon: '🪟', defaultSpec: DEFAULT_WINDOW },
  { kind: 'stairs',  label: 'Stairs',  icon: '🪜', defaultSpec: DEFAULT_STAIR  },
];
