export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Viewport state: all values live in screen-space coordinates. */
export interface ViewportState {
  /** Translation in screen pixels (from canvas origin to screen origin). */
  tx: number;
  ty: number;
  /** Zoom multiplier: screen_px = canvas_unit * scale */
  scale: number;
}

/** Visible region of the canvas, in canvas units. */
export interface CanvasVisibleRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
