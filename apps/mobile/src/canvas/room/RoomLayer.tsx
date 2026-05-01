import React from 'react';
import {
  Group, Rect, Paint, Path, Skia, Text, matchFont,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { CanvasRoom } from './useRoomStore';
import { ROOM_PALETTE, HANDLE_SIZE } from './roomColors';
import { canvasToScreen } from '../viewport';
import type { ViewportState } from '../types';

interface Props {
  rooms: CanvasRoom[];
  selectedId: string | null;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  scale: SharedValue<number>;
}

// ── Handle positions for the selected room ────────────────────────────────────

const ANCHORS = ['nw','n','ne','e','se','s','sw','w'] as const;

function handleOffset(anchor: string, w: number, h: number): { x: number; y: number } {
  const map: Record<string, { x: number; y: number }> = {
    nw: { x: 0,     y: 0     },
    n:  { x: w / 2, y: 0     },
    ne: { x: w,     y: 0     },
    e:  { x: w,     y: h / 2 },
    se: { x: w,     y: h     },
    s:  { x: w / 2, y: h     },
    sw: { x: 0,     y: h     },
    w:  { x: 0,     y: h / 2 },
  };
  return map[anchor] ?? { x: 0, y: 0 };
}

// ── Main component ────────────────────────────────────────────────────────────

export function RoomLayer({ rooms, selectedId, tx, ty, scale }: Props) {
  const font = matchFont({ fontFamily: 'System', fontSize: 12 });

  const roomPaths = useDerivedValue(() => {
    const s = scale.value;
    const ox = tx.value;
    const oy = ty.value;

    return rooms.map((room) => {
      const palette = ROOM_PALETTE[room.type] ?? ROOM_PALETTE.custom;
      const sx = room.x * s + ox;
      const sy = room.y * s + oy;
      const sw = room.w * s;
      const sh = room.h * s;

      return { room, palette, sx, sy, sw, sh };
    });
  }, [tx, ty, scale]);

  return (
    <>
      {roomPaths.value.map(({ room, palette, sx, sy, sw, sh }) => {
        const isSelected = room.id === selectedId;
        const hasCollision = room.hasCollision ?? false;

        return (
          <Group key={room.id}>
            {/* Fill */}
            <Rect
              x={sx} y={sy} width={sw} height={sh}
              color={palette.fill}
            />
            {/* Border — teal on collision, teak when selected, warm otherwise */}
            <Rect
              x={sx} y={sy} width={sw} height={sh}
              color={hasCollision ? '#C0392B' : isSelected ? '#A06A3A' : palette.stroke}
              style="stroke"
              strokeWidth={isSelected ? 2 : 1}
            />

            {/* Collision hatching */}
            {hasCollision && (
              <Rect
                x={sx} y={sy} width={sw} height={sh}
                color="rgba(192,57,43,0.08)"
              />
            )}

            {/* Room label (only when large enough on screen) */}
            {font && sw > 60 && sh > 40 && (
              <Text
                x={sx + sw / 2 - (ROOM_PALETTE[room.type]?.label.length ?? 6) * 3.5}
                y={sy + sh / 2 + 4}
                text={ROOM_PALETTE[room.type]?.label ?? room.type}
                font={font}
                color={isSelected ? '#6B4226' : '#8A857C'}
              />
            )}

            {/* Resize handles — only for selected room */}
            {isSelected && ANCHORS.map((anchor) => {
              const off = handleOffset(anchor, sw, sh);
              const hx = sx + off.x - HANDLE_SIZE / 2;
              const hy = sy + off.y - HANDLE_SIZE / 2;
              return (
                <Group key={anchor}>
                  <Rect x={hx} y={hy} width={HANDLE_SIZE} height={HANDLE_SIZE} color="#FFFFFF" />
                  <Rect x={hx} y={hy} width={HANDLE_SIZE} height={HANDLE_SIZE}
                        color="#A06A3A" style="stroke" strokeWidth={1.5} />
                </Group>
              );
            })}
          </Group>
        );
      })}
    </>
  );
}
