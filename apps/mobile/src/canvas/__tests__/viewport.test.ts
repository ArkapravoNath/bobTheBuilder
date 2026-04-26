/** @jest-environment node */
import {
  canvasToScreen,
  screenToCanvas,
  visibleRect,
  snapToGrid,
  snapPointToGrid,
  zoomAtFocalPoint,
  clampScale,
  firstGridLine,
} from '../viewport';
import { MIN_SCALE, MAX_SCALE, SNAP_GRID_IN } from '../constants';

// ── canvasToScreen ────────────────────────────────────────────────────────────

describe('canvasToScreen', () => {
  it('maps origin to translation at scale 1', () => {
    const r = canvasToScreen({ x: 0, y: 0 }, { tx: 50, ty: 80, scale: 1 });
    expect(r.x).toBe(50);
    expect(r.y).toBe(80);
  });

  it('scales canvas coords correctly', () => {
    const r = canvasToScreen({ x: 100, y: 200 }, { tx: 0, ty: 0, scale: 2 });
    expect(r.x).toBe(200);
    expect(r.y).toBe(400);
  });

  it('combines scale and translation', () => {
    const r = canvasToScreen({ x: 60, y: 120 }, { tx: 36, ty: 36, scale: 0.6 });
    expect(r.x).toBeCloseTo(72);   // 60*0.6 + 36
    expect(r.y).toBeCloseTo(108);  // 120*0.6 + 36
  });
});

// ── screenToCanvas ────────────────────────────────────────────────────────────

describe('screenToCanvas', () => {
  it('is the inverse of canvasToScreen', () => {
    const vp = { tx: 40, ty: 60, scale: 0.8 };
    const canvas = { x: 150, y: 240 };
    const screen = canvasToScreen(canvas, vp);
    const back   = screenToCanvas(screen, vp);
    expect(back.x).toBeCloseTo(canvas.x);
    expect(back.y).toBeCloseTo(canvas.y);
  });

  it('maps screen origin to (-tx/scale, -ty/scale)', () => {
    const vp = { tx: 60, ty: 80, scale: 2 };
    const r  = screenToCanvas({ x: 0, y: 0 }, vp);
    expect(r.x).toBeCloseTo(-30); // -60/2
    expect(r.y).toBeCloseTo(-40); // -80/2
  });
});

// ── visibleRect ───────────────────────────────────────────────────────────────

describe('visibleRect', () => {
  it('returns correct visible canvas range', () => {
    const vp = { tx: 36, ty: 36, scale: 0.6 };
    const r  = visibleRect(390, 844, vp);
    expect(r.left).toBeCloseTo((0 - 36) / 0.6);
    expect(r.top).toBeCloseTo((0 - 36) / 0.6);
    expect(r.right).toBeCloseTo((390 - 36) / 0.6);
    expect(r.bottom).toBeCloseTo((844 - 36) / 0.6);
  });
});

// ── snapToGrid ────────────────────────────────────────────────────────────────

describe('snapToGrid', () => {
  it('returns exact multiples unchanged', () => {
    expect(snapToGrid(0)).toBe(0);
    expect(snapToGrid(6)).toBe(6);
    expect(snapToGrid(12)).toBe(12);
    expect(snapToGrid(120)).toBe(120);
  });

  it('rounds up to nearest 6-inch mark', () => {
    expect(snapToGrid(4)).toBe(6);
    expect(snapToGrid(7)).toBe(6);
    expect(snapToGrid(9)).toBe(12);
  });

  it('handles negative values', () => {
    // Math.round(-3/6) = Math.round(-0.5) = 0 in JS (rounds toward +∞ at halfway)
    expect(snapToGrid(-3)).toBe(0);
    expect(snapToGrid(-10)).toBe(-12);
  });

  it('respects custom grid size', () => {
    expect(snapToGrid(14, 12)).toBe(12);
    expect(snapToGrid(18, 12)).toBe(24);
  });
});

describe('snapPointToGrid', () => {
  it('snaps both axes', () => {
    const r = snapPointToGrid({ x: 4, y: 9 });
    expect(r.x).toBe(6);
    expect(r.y).toBe(12);
  });
});

// ── zoomAtFocalPoint ──────────────────────────────────────────────────────────

describe('zoomAtFocalPoint', () => {
  it('keeps the focal point fixed in screen space', () => {
    const focalX = 200;
    const focalY = 400;
    const prevTx = 36;
    const prevTy = 36;
    const prevScale = 1;
    const newScale  = 2;

    const next = zoomAtFocalPoint(focalX, focalY, newScale, prevTx, prevTy, prevScale);

    // The canvas point at the focal position should map to the same screen point
    const canvasPt = screenToCanvas({ x: focalX, y: focalY }, { tx: prevTx, ty: prevTy, scale: prevScale });
    const afterScreen = canvasToScreen(canvasPt, next);

    expect(afterScreen.x).toBeCloseTo(focalX);
    expect(afterScreen.y).toBeCloseTo(focalY);
  });

  it('clamps scale to MAX_SCALE', () => {
    const r = zoomAtFocalPoint(0, 0, MAX_SCALE * 10, 0, 0, 1);
    expect(r.scale).toBe(MAX_SCALE);
  });

  it('clamps scale to MIN_SCALE', () => {
    const r = zoomAtFocalPoint(0, 0, MIN_SCALE / 10, 0, 0, 1);
    expect(r.scale).toBe(MIN_SCALE);
  });
});

// ── clampScale ────────────────────────────────────────────────────────────────

describe('clampScale', () => {
  it('passes through values in range', () => {
    expect(clampScale(1)).toBe(1);
    expect(clampScale(0.5)).toBe(0.5);
    expect(clampScale(2)).toBe(2);
  });

  it('clamps below MIN_SCALE', () => {
    expect(clampScale(0)).toBe(MIN_SCALE);
    expect(clampScale(-5)).toBe(MIN_SCALE);
  });

  it('clamps above MAX_SCALE', () => {
    expect(clampScale(1000)).toBe(MAX_SCALE);
  });
});

// ── firstGridLine ─────────────────────────────────────────────────────────────

describe('firstGridLine', () => {
  it('returns start if already on grid', () => {
    expect(firstGridLine(0,   12)).toBe(0);
    expect(firstGridLine(12,  12)).toBe(12);
    expect(firstGridLine(120, 12)).toBe(120);
  });

  it('returns next grid line above a non-grid start', () => {
    expect(firstGridLine(5,  12)).toBe(12);
    expect(firstGridLine(13, 12)).toBe(24);
  });

  it('handles negative starts', () => {
    expect(firstGridLine(-5,  12)).toBe(0);
    expect(firstGridLine(-13, 12)).toBe(-12);
  });
});
