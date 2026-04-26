import { useRef, useCallback, useState } from 'react';
import { useFrameCallback } from 'react-native-reanimated';
import { FRAME_BUDGET_MS } from '../constants';

export interface PerfStats {
  frameCount: number;
  droppedFrames: number;
  avgFps: number;
  minFps: number;
  jankScore: number; // droppedFrames / frameCount (0–1)
}

const WINDOW = 60; // rolling window size

export interface UsePerfHarnessReturn {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  getStats: () => PerfStats;
}

export function usePerfHarness(): UsePerfHarnessReturn {
  const active         = useRef(false);
  const [isRunning, setIsRunning] = useState(false);
  const frameTimes     = useRef<number[]>([]);
  const lastTime       = useRef<number | null>(null);
  const droppedCount   = useRef(0);
  const totalFrames    = useRef(0);

  const start = useCallback(() => {
    frameTimes.current   = [];
    lastTime.current     = null;
    droppedCount.current = 0;
    totalFrames.current  = 0;
    active.current = true;
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    active.current = false;
    setIsRunning(false);
  }, []);

  const getStats = useCallback((): PerfStats => {
    const times = frameTimes.current;
    if (times.length < 2) {
      return { frameCount: 0, droppedFrames: 0, avgFps: 0, minFps: 0, jankScore: 0 };
    }
    const fpsList = times.map((ms) => 1000 / ms).filter(Boolean);
    const avg = fpsList.reduce((a, b) => a + b, 0) / fpsList.length;
    const min = Math.min(...fpsList);
    const dropped = droppedCount.current;
    const total   = totalFrames.current;
    return {
      frameCount: total,
      droppedFrames: dropped,
      avgFps: Math.round(avg * 10) / 10,
      minFps: Math.round(min * 10) / 10,
      jankScore: total > 0 ? Math.round((dropped / total) * 1000) / 1000 : 0,
    };
  }, []);

  useFrameCallback((info) => {
    if (!active.current) return;
    const now = info.timestamp;
    if (lastTime.current !== null) {
      const delta = now - lastTime.current;
      frameTimes.current.push(delta);
      if (frameTimes.current.length > WINDOW) frameTimes.current.shift();
      totalFrames.current++;
      if (delta > FRAME_BUDGET_MS) droppedCount.current++;
    }
    lastTime.current = now;
  }, true);

  return { isRunning, start, stop, getStats };
}

/** Serialise perf stats to a JSON string suitable for a CI artifact. */
export function formatPerfReport(
  stats: PerfStats,
  label: string,
  rectCount?: number,
): string {
  return JSON.stringify(
    {
      label,
      timestamp: new Date().toISOString(),
      rectCount: rectCount ?? null,
      ...stats,
      pass: stats.avgFps >= 55 && stats.jankScore < 0.05,
    },
    null,
    2,
  );
}
