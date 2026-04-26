/** 1 canvas unit = 1 inch. */
export const UNITS_PER_INCH = 1;

/** Snap grid granularity: 6 inches. */
export const SNAP_GRID_IN = 6;

/** Minor grid interval: 1 foot = 12 inches. */
export const GRID_MINOR_IN = 12;

/** Major grid interval: 10 feet = 120 inches. */
export const GRID_MAJOR_IN = 120;

/** Scale at which minor (1-foot) grid lines appear. */
export const GRID_MINOR_APPEAR_SCALE = 0.3;

/** Scale at which snap (6-inch) grid lines appear. */
export const GRID_SNAP_APPEAR_SCALE = 1.0;

/** Minimum zoom-out (shows a very large area). */
export const MIN_SCALE = 0.1;

/** Maximum zoom-in (shows detail at ~2× real size). */
export const MAX_SCALE = 5.0;

/** Starting scale: 0.6 px per inch → a 50-ft-wide plan fits on screen. */
export const DEFAULT_SCALE = 0.6;

/** Ruler size in screen pixels. */
export const RULER_SIZE = 36;

/** Ruler tick colours & label settings. */
export const RULER_BG = '#F5F2EC';
export const RULER_TICK_COLOR = '#C4C0BA';
export const RULER_LABEL_COLOR = '#8A857C';
export const RULER_LABEL_SIZE = 10;

/** Grid colours. */
export const GRID_MAJOR_COLOR = 'rgba(42,40,37,0.15)';
export const GRID_MINOR_COLOR = 'rgba(42,40,37,0.07)';
export const GRID_SNAP_COLOR  = 'rgba(42,40,37,0.04)';

/** Performance budget: flag frames slower than this (ms). */
export const FRAME_BUDGET_MS = 1000 / 55; // ~18.2 ms  (55 fps floor)
