import { useEffect, useRef, useState } from 'react';

import type { PowerReading } from '@/api/types';
import type { PowerRow } from './transform';

const MAX_POINTS = 360; // one hour at the 10s polling cadence

/**
 * Pure accumulation step: append one row (timestamped by `now`) built from the
 * finite readings, keeping at most `maxPoints`. Extracted from the hook so the
 * clock is injectable and the logic is testable without a renderer.
 */
export function appendPowerRow(
  rows: PowerRow[],
  readings: PowerReading[],
  now: number,
  maxPoints = MAX_POINTS,
): PowerRow[] {
  const row: PowerRow = { time: now };
  for (const reading of readings) {
    if (reading.watts !== null && Number.isFinite(reading.watts)) {
      row[reading.name] = reading.watts;
    }
  }
  return [...rows.slice(-(maxPoints - 1)), row];
}

/** Accumulate a rolling window of wattage samples from the polled readings. */
export function usePowerHistory(
  readings: PowerReading[] | undefined,
  now: () => number = Date.now,
): PowerRow[] {
  const [rows, setRows] = useState<PowerRow[]>([]);
  const lastReadings = useRef<PowerReading[] | undefined>(undefined);

  useEffect(() => {
    if (!readings || readings === lastReadings.current) return;
    lastReadings.current = readings;
    setRows((previous) => appendPowerRow(previous, readings, now()));
  }, [readings, now]);

  return rows;
}
