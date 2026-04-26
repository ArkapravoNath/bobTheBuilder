import React from 'react';
import { Path, Skia, useDerivedValue } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import {
  GRID_MAJOR_IN,
  GRID_MINOR_IN,
  SNAP_GRID_IN,
  GRID_MAJOR_COLOR,
  GRID_MINOR_COLOR,
  GRID_SNAP_COLOR,
  GRID_MINOR_APPEAR_SCALE,
  GRID_SNAP_APPEAR_SCALE,
  RULER_SIZE,
} from '../constants';
import { firstGridLine } from '../viewport';

interface Props {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  scale: SharedValue<number>;
  screenW: number;
  screenH: number;
}

export function GridLayer({ tx, ty, scale, screenW, screenH }: Props) {
  // ── Major grid (10 ft) ────────────────────────────────────────────────────
  const majorPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = scale.value;
    const t = { x: tx.value, y: ty.value };

    // Visible canvas range
    const left   = (RULER_SIZE - t.x) / s;
    const top    = (RULER_SIZE - t.y) / s;
    const right  = (screenW - t.x) / s;
    const bottom = (screenH - t.y) / s;

    // Vertical lines
    for (let x = firstGridLine(left, GRID_MAJOR_IN); x <= right; x += GRID_MAJOR_IN) {
      const sx = x * s + t.x;
      path.moveTo(sx, RULER_SIZE);
      path.lineTo(sx, screenH);
    }
    // Horizontal lines
    for (let y = firstGridLine(top, GRID_MAJOR_IN); y <= bottom; y += GRID_MAJOR_IN) {
      const sy = y * s + t.y;
      path.moveTo(RULER_SIZE, sy);
      path.lineTo(screenW, sy);
    }
    return path;
  }, [tx, ty, scale]);

  // ── Minor grid (1 ft) — only above GRID_MINOR_APPEAR_SCALE ───────────────
  const minorPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = scale.value;
    if (s < GRID_MINOR_APPEAR_SCALE) return path;

    const t = { x: tx.value, y: ty.value };
    const left   = (RULER_SIZE - t.x) / s;
    const top    = (RULER_SIZE - t.y) / s;
    const right  = (screenW - t.x) / s;
    const bottom = (screenH - t.y) / s;

    for (let x = firstGridLine(left, GRID_MINOR_IN); x <= right; x += GRID_MINOR_IN) {
      // Skip major lines (already drawn)
      if (x % GRID_MAJOR_IN === 0) continue;
      const sx = x * s + t.x;
      path.moveTo(sx, RULER_SIZE);
      path.lineTo(sx, screenH);
    }
    for (let y = firstGridLine(top, GRID_MINOR_IN); y <= bottom; y += GRID_MINOR_IN) {
      if (y % GRID_MAJOR_IN === 0) continue;
      const sy = y * s + t.y;
      path.moveTo(RULER_SIZE, sy);
      path.lineTo(screenW, sy);
    }
    return path;
  }, [tx, ty, scale]);

  // ── Snap grid (6 in) — only above GRID_SNAP_APPEAR_SCALE ─────────────────
  const snapPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = scale.value;
    if (s < GRID_SNAP_APPEAR_SCALE) return path;

    const t = { x: tx.value, y: ty.value };
    const left   = (RULER_SIZE - t.x) / s;
    const top    = (RULER_SIZE - t.y) / s;
    const right  = (screenW - t.x) / s;
    const bottom = (screenH - t.y) / s;

    for (let x = firstGridLine(left, SNAP_GRID_IN); x <= right; x += SNAP_GRID_IN) {
      if (x % GRID_MINOR_IN === 0) continue;
      const sx = x * s + t.x;
      path.moveTo(sx, RULER_SIZE);
      path.lineTo(sx, screenH);
    }
    for (let y = firstGridLine(top, SNAP_GRID_IN); y <= bottom; y += SNAP_GRID_IN) {
      if (y % GRID_MINOR_IN === 0) continue;
      const sy = y * s + t.y;
      path.moveTo(RULER_SIZE, sy);
      path.lineTo(screenW, sy);
    }
    return path;
  }, [tx, ty, scale]);

  return (
    <>
      <Path path={snapPath}  color={GRID_SNAP_COLOR}  style="stroke" strokeWidth={0.5} />
      <Path path={minorPath} color={GRID_MINOR_COLOR} style="stroke" strokeWidth={0.5} />
      <Path path={majorPath} color={GRID_MAJOR_COLOR} style="stroke" strokeWidth={1}   />
    </>
  );
}
