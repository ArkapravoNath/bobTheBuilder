import React, { useState, useCallback, useMemo } from 'react';
import {
  Path,
  Rect,
  Skia,
  Text,
  matchFont,
  useDerivedValue,
} from '@shopify/react-native-skia';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import {
  RULER_SIZE,
  RULER_BG,
  RULER_TICK_COLOR,
  RULER_LABEL_COLOR,
  RULER_LABEL_SIZE,
  GRID_MINOR_IN,
  GRID_MAJOR_IN,
} from '../constants';
import { firstGridLine } from '../viewport';

interface Props {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  scale: SharedValue<number>;
  screenW: number;
  screenH: number;
}

interface LabelItem {
  key: string;
  x: number;
  y: number;
  text: string;
}

// Show a foot label every 10 ft (120 canvas units)
const LABEL_INTERVAL = 120;

// ── Tick paths (UI-thread via Skia useDerivedValue) ───────────────────────────

export function RulerOverlay({ tx, ty, scale, screenW, screenH }: Props) {
  const font = matchFont({ familyName: 'System', fontSize: RULER_LABEL_SIZE });

  // ── Horizontal ticks ──────────────────────────────────────────────────────
  const hTickPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = scale.value;
    const ox = tx.value;
    const left  = (RULER_SIZE - ox) / s;
    const right = (screenW - ox) / s;

    for (let x = firstGridLine(left, GRID_MINOR_IN); x <= right; x += GRID_MINOR_IN) {
      const sx = x * s + ox;
      if (sx < RULER_SIZE) continue;
      const isMajor = x % GRID_MAJOR_IN === 0;
      const tickH = isMajor ? RULER_SIZE * 0.55 : RULER_SIZE * 0.3;
      path.moveTo(sx, RULER_SIZE - tickH);
      path.lineTo(sx, RULER_SIZE);
    }
    return path;
  }, [tx, scale]);

  // ── Vertical ticks ────────────────────────────────────────────────────────
  const vTickPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = scale.value;
    const oy = ty.value;
    const top    = (RULER_SIZE - oy) / s;
    const bottom = (screenH - oy) / s;

    for (let y = firstGridLine(top, GRID_MINOR_IN); y <= bottom; y += GRID_MINOR_IN) {
      const sy = y * s + oy;
      if (sy < RULER_SIZE) continue;
      const isMajor = y % GRID_MAJOR_IN === 0;
      const tickW = isMajor ? RULER_SIZE * 0.55 : RULER_SIZE * 0.3;
      path.moveTo(RULER_SIZE - tickW, sy);
      path.lineTo(RULER_SIZE, sy);
    }
    return path;
  }, [ty, scale]);

  // ── Ruler border path (static — memoized) ────────────────────────────────
  const borderPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(RULER_SIZE, RULER_SIZE); p.lineTo(screenW, RULER_SIZE);
    p.moveTo(RULER_SIZE, RULER_SIZE); p.lineTo(RULER_SIZE, screenH);
    return p;
  }, [screenW, screenH]);

  // ── Labels via useAnimatedReaction → React state ──────────────────────────
  // Labels run on JS thread so they lag slightly during fast gestures — fine
  // for a ruler which is informational, not interactive.
  const [hLabels, setHLabels] = useState<LabelItem[]>([]);
  const [vLabels, setVLabels] = useState<LabelItem[]>([]);

  const computeHLabels = useCallback(
    (oxVal: number, sVal: number) => {
      const items: LabelItem[] = [];
      const left  = (RULER_SIZE - oxVal) / sVal;
      const right = (screenW - oxVal) / sVal;
      for (let x = firstGridLine(left, LABEL_INTERVAL); x <= right; x += LABEL_INTERVAL) {
        const sx = x * sVal + oxVal;
        if (sx < RULER_SIZE + 4) continue;
        items.push({ key: `h${x}`, x: sx + 2, y: RULER_SIZE - RULER_LABEL_SIZE - 2, text: `${Math.round(x / 12)}′` });
      }
      return items;
    },
    [screenW],
  );

  const computeVLabels = useCallback(
    (oyVal: number, sVal: number) => {
      const items: LabelItem[] = [];
      const top    = (RULER_SIZE - oyVal) / sVal;
      const bottom = (screenH - oyVal) / sVal;
      for (let y = firstGridLine(top, LABEL_INTERVAL); y <= bottom; y += LABEL_INTERVAL) {
        const sy = y * sVal + oyVal;
        if (sy < RULER_SIZE + 4) continue;
        items.push({ key: `v${y}`, x: 2, y: sy + RULER_LABEL_SIZE, text: `${Math.round(y / 12)}′` });
      }
      return items;
    },
    [screenH],
  );

  useAnimatedReaction(
    () => ({ tx: tx.value, ty: ty.value, scale: scale.value }),
    (cur) => {
      runOnJS(setHLabels)(computeHLabels(cur.tx, cur.scale));
      runOnJS(setVLabels)(computeVLabels(cur.ty, cur.scale));
    },
    [tx, ty, scale],
  );

  return (
    <>
      {/* Ruler backgrounds */}
      <Rect x={0} y={0} width={screenW} height={RULER_SIZE} color={RULER_BG} />
      <Rect x={0} y={0} width={RULER_SIZE} height={screenH} color={RULER_BG} />
      {/* Corner cap */}
      <Rect x={0} y={0} width={RULER_SIZE} height={RULER_SIZE} color={RULER_BG} />

      {/* Ticks */}
      <Path path={hTickPath} color={RULER_TICK_COLOR} style="stroke" strokeWidth={1} />
      <Path path={vTickPath} color={RULER_TICK_COLOR} style="stroke" strokeWidth={1} />

      {/* Border lines */}
      <Path path={borderPath} color={RULER_TICK_COLOR} style="stroke" strokeWidth={1} />

      {/* Foot labels */}
      {font && hLabels.map((l) => (
        <Text key={l.key} x={l.x} y={l.y} text={l.text} font={font} color={RULER_LABEL_COLOR} />
      ))}
      {font && vLabels.map((l) => (
        <Text key={l.key} x={l.x} y={l.y} text={l.text} font={font} color={RULER_LABEL_COLOR} />
      ))}
    </>
  );
}
