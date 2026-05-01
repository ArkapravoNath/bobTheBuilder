import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDerivedValue } from 'react-native-reanimated';
import { GridLayer } from './layers/GridLayer';
import { RulerOverlay } from './layers/RulerOverlay';
import { FloorTabs } from './floor/FloorTabs';
import { useViewport } from './useViewport';
import { RULER_SIZE, DEFAULT_SCALE } from './constants';

interface Props {
  screenW: number;
  screenH: number;
  onViewportChange?: (tx: number, ty: number, scale: number) => void;
  /** Floor-plan content rendered inside the viewport-transform group. */
  children?: React.ReactNode;
  initialTx?: number;
  initialTy?: number;
  initialScale?: number;
  /** Pass false to hide floor tabs (e.g. in single-room designs). */
  showFloorTabs?: boolean;
}

export function CanvasView({
  screenW,
  screenH,
  onViewportChange,
  children,
  initialTx = RULER_SIZE + 20,
  initialTy = RULER_SIZE + 20,
  initialScale = DEFAULT_SCALE,
  showFloorTabs = true,
}: Props) {
  const { tx, ty, scale, gesture } = useViewport(initialTx, initialTy, initialScale);

  const contentTransform = useDerivedValue(
    () => [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    [tx, ty, scale],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { width: screenW, height: screenH }]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <GridLayer tx={tx} ty={ty} scale={scale} screenW={screenW} screenH={screenH} />
          <Group transform={contentTransform}>{children}</Group>
          <RulerOverlay tx={tx} ty={ty} scale={scale} screenW={screenW} screenH={screenH} />
        </Canvas>

        {/* Floor tabs sit above the Skia canvas as a React Native overlay */}
        {showFloorTabs && <FloorTabs screenH={screenH} />}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FBFAF7',
    overflow: 'hidden',
  },
});

export { useViewport };
