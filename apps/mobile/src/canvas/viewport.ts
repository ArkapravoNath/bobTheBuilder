import { MIN_SCALE, MAX_SCALE, SNAP_GRID_IN } from './constants';
import type { CanvasPoint, CanvasVisibleRect, ViewportState } from './types';

// ── Coordinate transforms ─────────────────────────────────────────────────────

/** Convert a canvas-space point to screen-space pixels. */
export function canvasToScreen(
  p: CanvasPoint,
  vp: ViewportState,
): CanvasPoint {
  'worklet';
  return {
    x: p.x * vp.scale + vp.tx,
    y: p.y * vp.scale + vp.ty,
  };
}

/** Convert a screen-space pixel to canvas-space units. */
export function screenToCanvas(
  p: CanvasPoint,
  vp: ViewportState,
): CanvasPoint {
  'worklet';
  return {
    x: (p.x - vp.tx) / vp.scale,
    y: (p.y - vp.ty) / vp.scale,
  };
}

/** Return the canvas-space rectangle currently visible on screen. */
export function visibleRect(
  screenW: number,
  screenH: number,
  vp: ViewportState,
): CanvasVisibleRect {
  'worklet';
  const tl = screenToCanvas({ x: 0, y: 0 }, vp);
  const br = screenToCanvas({ x: screenW, y: screenH }, vp);
  return { left: tl.x, top: tl.y, right: br.x, bottom: br.y };
}

// ── Snap to grid ──────────────────────────────────────────────────────────────

/** Snap a canvas-unit value to the nearest SNAP_GRID_IN-inch grid line. */
export function snapToGrid(value: number, gridSize = SNAP_GRID_IN): number {
  'worklet';
  // Add 0 to normalise -0 → 0.
  return Math.round(value / gridSize) * gridSize + 0;
}

/** Snap a canvas-space point to the nearest grid intersection. */
export function snapPointToGrid(
  p: CanvasPoint,
  gridSize = SNAP_GRID_IN,
): CanvasPoint {
  'worklet';
  return {
    x: snapToGrid(p.x, gridSize),
    y: snapToGrid(p.y, gridSize),
  };
}

// ── Zoom ──────────────────────────────────────────────────────────────────────

/**
 * Compute new viewport state after a pinch-zoom gesture.
 *
 * Keeps the focal point (in screen space) fixed as the scale changes,
 * so the canvas appears to zoom in/out toward where the user is pinching.
 *
 *   tx_new = focalX * (1 - newScale/oldScale) + tx_old * (newScale/oldScale)
 */
export function zoomAtFocalPoint(
  focalX: number,
  focalY: number,
  newScale: number,
  prevTx: number,
  prevTy: number,
  prevScale: number,
): { tx: number; ty: number; scale: number } {
  'worklet';
  const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
  const ratio = clampedScale / prevScale;
  return {
    scale: clampedScale,
    tx: focalX * (1 - ratio) + prevTx * ratio,
    ty: focalY * (1 - ratio) + prevTy * ratio,
  };
}

/** Clamp scale to [MIN_SCALE, MAX_SCALE]. */
export function clampScale(scale: number): number {
  'worklet';
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
}

// ── Grid line helpers (used in GridLayer worklet) ─────────────────────────────

/**
 * Return the first grid-line value >= start that is a multiple of `interval`.
 * E.g. firstGridLine(-37, 12) → -36
 */
export function firstGridLine(start: number, interval: number): number {
  'worklet';
  return Math.ceil(start / interval) * interval + 0;
}
