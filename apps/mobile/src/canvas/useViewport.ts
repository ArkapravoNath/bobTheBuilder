import { useSharedValue } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { useCallback } from 'react';
import { DEFAULT_SCALE, MIN_SCALE, MAX_SCALE } from './constants';
import { zoomAtFocalPoint, clampScale } from './viewport';

export interface UseViewportReturn {
  /** Live Reanimated shared values — read these inside Skia worklets. */
  tx: ReturnType<typeof useSharedValue<number>>;
  ty: ReturnType<typeof useSharedValue<number>>;
  scale: ReturnType<typeof useSharedValue<number>>;
  /** Composed RNGH gesture — attach to <GestureDetector>. */
  gesture: ReturnType<typeof Gesture.Simultaneous>;
  /** Reset viewport to default position and scale. */
  resetViewport: () => void;
  /** Zoom to fit a canvas-space rect on screen. */
  zoomToFit: (canvasW: number, canvasH: number, screenW: number, screenH: number) => void;
}

export function useViewport(
  initialTx = 40,
  initialTy = 60,
  initialScale = DEFAULT_SCALE,
): UseViewportReturn {
  const tx    = useSharedValue(initialTx);
  const ty    = useSharedValue(initialTy);
  const scale = useSharedValue(initialScale);

  // Saved-at-gesture-start values (all on UI thread)
  const savedTx    = useSharedValue(initialTx);
  const savedTy    = useSharedValue(initialTy);
  const savedScale = useSharedValue(initialScale);

  // ── Pan gesture ─────────────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      'worklet';
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      'worklet';
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      'worklet';
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  // ── Pinch gesture ────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      savedScale.value = scale.value;
      savedTx.value    = tx.value;
      savedTy.value    = ty.value;
    })
    .onUpdate((e) => {
      'worklet';
      const newScale = clampScale(savedScale.value * e.scale);
      const next = zoomAtFocalPoint(
        e.focalX,
        e.focalY,
        newScale,
        savedTx.value,
        savedTy.value,
        savedScale.value,
      );
      scale.value = next.scale;
      tx.value    = next.tx;
      ty.value    = next.ty;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      savedTx.value    = tx.value;
      savedTy.value    = ty.value;
    });

  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const resetViewport = useCallback(() => {
    tx.value    = initialTx;
    ty.value    = initialTy;
    scale.value = initialScale;
    savedTx.value    = initialTx;
    savedTy.value    = initialTy;
    savedScale.value = initialScale;
  }, []);

  const zoomToFit = useCallback(
    (canvasW: number, canvasH: number, screenW: number, screenH: number) => {
      const padding = 40;
      const fitScale = Math.min(
        (screenW - padding * 2) / canvasW,
        (screenH - padding * 2) / canvasH,
        MAX_SCALE,
      );
      const clamped = Math.max(MIN_SCALE, fitScale);
      scale.value = clamped;
      tx.value    = (screenW - canvasW * clamped) / 2;
      ty.value    = (screenH - canvasH * clamped) / 2;
      savedScale.value = clamped;
      savedTx.value    = tx.value;
      savedTy.value    = ty.value;
    },
    [],
  );

  return { tx, ty, scale, gesture, resetViewport, zoomToFit };
}
