import type { DeviceEnergy } from '@/api/types';

/** Flat row shape for Recharts: bucket timestamp + one value per series. */
export interface EnergyRow {
  time: number;
  [series: string]: number;
}

/** Same flat row shape used by the live-power line chart (values in watts). */
export type PowerRow = EnergyRow;

export interface EnergySeriesData {
  rows: EnergyRow[];
  /** Series names in fixed display order (by total energy, descending). */
  series: string[];
}

export const OTHER_SERIES = 'Other';

/** Rank comparator against a fixed ordering; unranked names sort last, then A–Z. */
export function byRanking(ranking: string[]): (a: string, b: string) => number {
  const rankOf = (name: string) => {
    const index = ranking.indexOf(name);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return (a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b);
}

/**
 * Reshape per-device energy samples into stacked chart rows.
 *
 * Preserves the behaviors of the original 2021 dashboard: every bucket is
 * zero-filled for every device (stacks need complete rows), rows are sorted
 * by time, and the trailing partial bucket (today / the current month) is
 * dropped so the last bar isn't misleadingly small. Values convert Wh -> kWh.
 */
export function toEnergyRows(
  devices: DeviceEnergy[],
  granularity: 'day' | 'month',
  now: Date = new Date(),
): EnergySeriesData {
  const totals = new Map<string, number>();
  const buckets = new Map<number, EnergyRow>();

  for (const device of devices) {
    for (const sample of device.samples) {
      if (!Number.isFinite(sample.energyWh)) continue;
      const time = sample.date.getTime();
      const row = buckets.get(time) ?? { time };
      row[device.name] = (row[device.name] ?? 0) + sample.energyWh / 1000;
      buckets.set(time, row);
      totals.set(device.name, (totals.get(device.name) ?? 0) + sample.energyWh);
    }
  }

  const series = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);

  const partialBucket =
    granularity === 'day'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      : new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const rows = [...buckets.values()]
    .filter((row) => row.time !== partialBucket)
    .sort((a, b) => a.time - b.time)
    .map((row) => {
      const filled: EnergyRow = { time: row.time };
      for (const name of series) filled[name] = row[name] ?? 0;
      return filled;
    });

  return { rows, series };
}

/**
 * Fold everything past the first `max` series into a single "Other" series.
 * Categorical palettes don't stretch past a handful of hues; the fold keeps
 * color assignments stable and legal.
 */
export function capSeries(data: EnergySeriesData, max: number): EnergySeriesData {
  return capSeriesTo(data, data.series.slice(0, max));
}

/**
 * Fold every series NOT in `keep` into "Other". Used with one global keep-list
 * so all charts on a page fold the same devices and share color assignments.
 */
export function capSeriesTo(data: EnergySeriesData, keep: string[]): EnergySeriesData {
  const keepSet = new Set(keep);
  if (data.series.every((name) => keepSet.has(name))) return data;

  const kept = data.series.filter((name) => keepSet.has(name));
  const folded = new Set(data.series.filter((name) => !keepSet.has(name)));

  const rows = data.rows.map((row) => {
    const capped: EnergyRow = { time: row.time };
    let other = 0;
    for (const [key, value] of Object.entries(row)) {
      if (key === 'time') continue;
      if (folded.has(key)) other += value;
      else capped[key] = value;
    }
    capped[OTHER_SERIES] = other;
    return capped;
  });

  return { rows, series: [...kept, OTHER_SERIES] };
}

/** Keep only the named series (client-side filter that never repaints survivors). */
export function filterSeries(data: EnergySeriesData, needle: string): EnergySeriesData {
  const query = needle.trim().toLowerCase();
  if (!query) return data;
  const series = data.series.filter((name) => name.toLowerCase().includes(query));
  const keep = new Set(series);
  const rows = data.rows.map((row) => {
    const filtered: EnergyRow = { time: row.time };
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'time' && keep.has(key)) filtered[key] = value;
    }
    return filtered;
  });
  return { rows, series };
}

/**
 * A chart view for one dataset: filter by name, then either show the matches
 * as-is (when few enough) or fold the long tail into "Other" against the shared
 * `topSeries` keep-list so colors stay stable across charts.
 */
export function chartView(
  data: EnergySeriesData,
  filter: string,
  topSeries: string[],
  cap: number,
): EnergySeriesData {
  const filtered = filterSeries(data, filter);
  return filtered.series.length <= cap ? filtered : capSeriesTo(filtered, topSeries);
}

/**
 * Live-power view over accumulated rows. Unlike the energy bars, power rows are
 * sparse (a device may have no reading in a given tick), so folded values are
 * only written where present and "Other" appears only when something folds.
 */
export function powerView(
  rows: PowerRow[],
  readingNames: string[],
  ranking: string[],
  cap: number,
): { rows: PowerRow[]; series: string[] } {
  const compare = byRanking(ranking);
  const names = [...new Set(readingNames)];
  if (names.length <= cap) {
    return { rows, series: names.sort(compare) };
  }

  const top = ranking.slice(0, cap);
  const kept = names.filter((name) => top.includes(name)).sort(compare);
  const foldedSet = new Set(names.filter((name) => !kept.includes(name)));
  if (foldedSet.size === 0) {
    return { rows, series: kept };
  }

  const foldedRows = rows.map((row) => {
    const next: PowerRow = { time: row.time };
    for (const name of kept) {
      if (row[name] !== undefined) next[name] = row[name];
    }
    let other = 0;
    let sawAny = false;
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'time' && foldedSet.has(key)) {
        other += value;
        sawAny = true;
      }
    }
    if (sawAny) next[OTHER_SERIES] = Math.round(other * 100) / 100;
    return next;
  });

  return { rows: foldedRows, series: [...kept, OTHER_SERIES] };
}
