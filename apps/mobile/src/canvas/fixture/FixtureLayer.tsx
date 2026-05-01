import React from 'react';
import { Group, Path, Rect, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { CanvasFixture, DoorSpec, WindowSpec, StairSpec } from './fixtureTypes';
import { anchorToCanvasPos, roomWalls } from './wallSnap';
import type { CanvasRoom } from '../room/useRoomStore';

const WALL_DEPTH = 6; // canvas units — thickness of wall representation

interface Props {
  fixtures: CanvasFixture[];
  rooms: CanvasRoom[];
  selectedId: string | null;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  scale: SharedValue<number>;
}

// ── Individual fixture renderers ───────────────────────────────────────────────

function buildDoorPath(
  cx: number, cy: number, angleDeg: number, spec: DoorSpec, openInward: boolean,
  sx: number, sy: number, s: number,
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  const w = spec.widthIn * s;
  const thickness = WALL_DEPTH * s;
  const swingR = w;

  // Transform to screen space
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const px = cx * s + sx;
  const py = cy * s + sy;

  function rot(dx: number, dy: number) {
    return { x: px + dx * cos - dy * sin, y: py + dx * sin + dy * cos };
  }

  const dir = openInward ? 1 : -1;
  const hinge = rot(-w / 2, 0);
  const doorEnd = rot(w / 2, 0);

  // Door leaf rectangle
  const p0 = rot(-w / 2, 0);
  const p1 = rot(w / 2, 0);
  const p2 = rot(w / 2, dir * thickness);
  const p3 = rot(-w / 2, dir * thickness);
  path.moveTo(p0.x, p0.y);
  path.lineTo(p1.x, p1.y);
  path.lineTo(p2.x, p2.y);
  path.lineTo(p3.x, p3.y);
  path.close();

  // Swing arc (quarter circle)
  const arcPath = Skia.Path.Make();
  const startAng = openInward ? angleDeg - 90 : angleDeg + 90;
  arcPath.addArc(
    { x: hinge.x - swingR, y: hinge.y - swingR, width: swingR * 2, height: swingR * 2 },
    startAng,
    openInward ? 90 : -90,
  );

  return path;
}

function buildWindowPath(
  cx: number, cy: number, angleDeg: number, spec: WindowSpec,
  sx: number, sy: number, s: number,
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  const w = spec.widthIn * s;
  const h = WALL_DEPTH * s;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const px = cx * s + sx;
  const py = cy * s + sy;
  function rot(dx: number, dy: number) {
    return { x: px + dx * cos - dy * sin, y: py + dx * sin + dy * cos };
  }
  const p0 = rot(-w / 2, -h / 2);
  const p1 = rot(w / 2, -h / 2);
  const p2 = rot(w / 2, h / 2);
  const p3 = rot(-w / 2, h / 2);
  path.moveTo(p0.x, p0.y);
  path.lineTo(p1.x, p1.y);
  path.lineTo(p2.x, p2.y);
  path.lineTo(p3.x, p3.y);
  path.close();

  // Pane dividers
  const panes = spec.panes;
  for (let i = 1; i < panes; i++) {
    const t = i / panes;
    const ta = rot(-w / 2 + t * w, -h / 2);
    const tb = rot(-w / 2 + t * w, h / 2);
    path.moveTo(ta.x, ta.y);
    path.lineTo(tb.x, tb.y);
  }
  return path;
}

function buildStairPath(
  cx: number, cy: number, spec: StairSpec,
  sx: number, sy: number, s: number,
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  const w = spec.widthIn * s;
  const runLen = spec.runIn * s;
  const riserCount = spec.riserCount;

  // Direction → angle
  const angleMap: Record<string, number> = { N: 0, E: 90, S: 180, W: 270 };
  const rad = (angleMap[spec.direction] * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const px = cx * s + sx;
  const py = cy * s + sy;
  function rot(dx: number, dy: number) {
    return { x: px + dx * cos - dy * sin, y: py + dx * sin + dy * cos };
  }

  // Outer rectangle
  const p0 = rot(-w / 2, -runLen / 2);
  const p1 = rot(w / 2, -runLen / 2);
  const p2 = rot(w / 2, runLen / 2);
  const p3 = rot(-w / 2, runLen / 2);
  path.moveTo(p0.x, p0.y);
  path.lineTo(p1.x, p1.y);
  path.lineTo(p2.x, p2.y);
  path.lineTo(p3.x, p3.y);
  path.close();

  // Step lines
  for (let i = 1; i < riserCount; i++) {
    const t = (i / riserCount) - 0.5;
    const la = rot(-w / 2, t * runLen);
    const lb = rot(w / 2, t * runLen);
    path.moveTo(la.x, la.y);
    path.lineTo(lb.x, lb.y);
  }

  // Arrow pointing in direction of ascent
  const arrowTip  = rot(0, -runLen / 2 - 8);
  const arrowL    = rot(-6, -runLen / 2 + 4);
  const arrowR    = rot(6,  -runLen / 2 + 4);
  path.moveTo(arrowTip.x, arrowTip.y);
  path.lineTo(arrowL.x, arrowL.y);
  path.moveTo(arrowTip.x, arrowTip.y);
  path.lineTo(arrowR.x, arrowR.y);

  return path;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FixtureLayer({ fixtures, rooms, selectedId, tx, ty, scale }: Props) {
  const rendered = useDerivedValue(() => {
    const s  = scale.value;
    const ox = tx.value;
    const oy = ty.value;

    return fixtures.map((fixture) => {
      if (!fixture.anchor) return null;
      const room = rooms.find((r) => r.id === fixture.anchor!.roomId);
      if (!room) return null;

      const { x, y, angleDeg } = anchorToCanvasPos(fixture.anchor, room);
      const isSelected = fixture.id === selectedId;

      return { fixture, x, y, angleDeg, isSelected, s, ox, oy };
    }).filter(Boolean);
  }, [tx, ty, scale]);

  // Render each fixture (runs on JS thread — Skia handles GPU)
  return (
    <>
      {rendered.value.map((item) => {
        if (!item) return null;
        const { fixture, x, y, angleDeg, isSelected, s, ox, oy } = item;
        const anchor = fixture.anchor!;

        let path = Skia.Path.Make();
        let fill  = '#FFFFFF';
        let stroke = isSelected ? '#A06A3A' : '#6B4226';

        if (fixture.kind === 'door') {
          const spec = fixture.spec as DoorSpec;
          path = buildDoorPath(x, y, angleDeg, spec, anchor.openInward, ox, oy, s);
          fill = '#D4A882';
        } else if (fixture.kind === 'window') {
          const spec = fixture.spec as WindowSpec;
          path = buildWindowPath(x, y, angleDeg, spec, ox, oy, s);
          fill = '#C8DCEE';
          stroke = isSelected ? '#A06A3A' : '#7A9E8A';
        } else if (fixture.kind === 'stairs') {
          const spec = fixture.spec as StairSpec;
          path = buildStairPath(x, y, spec, ox, oy, s);
          fill = '#EDE8E0';
          stroke = isSelected ? '#A06A3A' : '#A89880';
        }

        return (
          <Group key={fixture.id}>
            <Path path={path} color={fill} />
            <Path path={path} color={stroke} style="stroke" strokeWidth={isSelected ? 2 : 1} />
          </Group>
        );
      })}
    </>
  );
}
