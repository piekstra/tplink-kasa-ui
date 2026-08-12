import { describe, expect, it } from 'vitest';

import type { DeviceEnergy } from '@/api/types';
import { capSeries, capSeriesTo, filterSeries, OTHER_SERIES, toEnergyRows } from './transform';

const NOW = new Date(2026, 7, 12); // Aug 12 2026

function device(name: string, samples: [Date, number][]): DeviceEnergy {
  return {
    deviceId: `id-${name}`,
    name,
    samples: samples.map(([date, energyWh]) => ({ date, energyWh })),
  };
}

describe('toEnergyRows', () => {
  it('converts Wh to kWh and sorts buckets by time', () => {
    const data = toEnergyRows(
      [
        device('Lamp', [
          [new Date(2026, 7, 11), 500],
          [new Date(2026, 7, 9), 1500],
        ]),
      ],
      'day',
      NOW,
    );

    expect(data.rows.map((r) => r.time)).toEqual([
      new Date(2026, 7, 9).getTime(),
      new Date(2026, 7, 11).getTime(),
    ]);
    expect(data.rows[0].Lamp).toBe(1.5);
    expect(data.rows[1].Lamp).toBe(0.5);
  });

  it('zero-fills buckets where a device has no sample', () => {
    const data = toEnergyRows(
      [
        device('Lamp', [[new Date(2026, 7, 10), 1000]]),
        device('Heater', [[new Date(2026, 7, 11), 2000]]),
      ],
      'day',
      NOW,
    );

    expect(data.rows).toHaveLength(2);
    expect(data.rows[0].Heater).toBe(0);
    expect(data.rows[1].Lamp).toBe(0);
  });

  it('drops the trailing partial bucket for days and months', () => {
    const daily = toEnergyRows(
      [
        device('Lamp', [
          [new Date(2026, 7, 11), 1000],
          [new Date(2026, 7, 12), 400], // today: partial
        ]),
      ],
      'day',
      NOW,
    );
    expect(daily.rows.map((r) => r.time)).toEqual([new Date(2026, 7, 11).getTime()]);

    const monthly = toEnergyRows(
      [
        device('Lamp', [
          [new Date(2026, 6, 1), 30000],
          [new Date(2026, 7, 1), 12000], // current month: partial
        ]),
      ],
      'month',
      NOW,
    );
    expect(monthly.rows.map((r) => r.time)).toEqual([new Date(2026, 6, 1).getTime()]);
  });

  it('ignores non-finite samples', () => {
    const data = toEnergyRows(
      [
        device('Lamp', [
          [new Date(2026, 7, 10), Infinity],
          [new Date(2026, 7, 11), 1000],
        ]),
      ],
      'day',
      NOW,
    );

    expect(data.rows).toHaveLength(1);
    expect(data.rows[0].Lamp).toBe(1);
  });

  it('orders series by total energy, descending', () => {
    const data = toEnergyRows(
      [
        device('Small', [[new Date(2026, 7, 10), 100]]),
        device('Big', [[new Date(2026, 7, 10), 9000]]),
      ],
      'day',
      NOW,
    );

    expect(data.series).toEqual(['Big', 'Small']);
  });
});

describe('capSeries', () => {
  const base = toEnergyRows(
    [
      device('A', [[new Date(2026, 7, 10), 4000]]),
      device('B', [[new Date(2026, 7, 10), 3000]]),
      device('C', [[new Date(2026, 7, 10), 2000]]),
      device('D', [[new Date(2026, 7, 10), 1000]]),
    ],
    'day',
    NOW,
  );

  it('folds series past the cap into Other', () => {
    const capped = capSeries(base, 2);

    expect(capped.series).toEqual(['A', 'B', OTHER_SERIES]);
    expect(capped.rows[0][OTHER_SERIES]).toBe(3); // C (2 kWh) + D (1 kWh)
    expect(capped.rows[0].A).toBe(4);
  });

  it('leaves data untouched when under the cap', () => {
    expect(capSeries(base, 10)).toBe(base);
  });
});

describe('filterSeries', () => {
  const base = toEnergyRows(
    [
      device('Desk Lamp', [[new Date(2026, 7, 10), 1000]]),
      device('Heater', [[new Date(2026, 7, 10), 2000]]),
    ],
    'day',
    NOW,
  );

  it('keeps only matching series without renaming or reordering', () => {
    const filtered = filterSeries(base, 'lamp');

    expect(filtered.series).toEqual(['Desk Lamp']);
    expect(filtered.rows[0]['Desk Lamp']).toBe(1);
    expect(filtered.rows[0].Heater).toBeUndefined();
  });

  it('returns everything for a blank query', () => {
    expect(filterSeries(base, '  ')).toBe(base);
  });
});

describe('capSeriesTo', () => {
  const base = toEnergyRows(
    [
      device('A', [[new Date(2026, 7, 10), 4000]]),
      device('B', [[new Date(2026, 7, 10), 3000]]),
      device('C', [[new Date(2026, 7, 10), 2000]]),
    ],
    'day',
    NOW,
  );

  it('folds everything outside the keep list, preserving keep colors slots', () => {
    const capped = capSeriesTo(base, ['B']);

    expect(capped.series).toEqual(['B', OTHER_SERIES]);
    expect(capped.rows[0][OTHER_SERIES]).toBe(6); // A (4) + C (2)
    expect(capped.rows[0].B).toBe(3);
  });

  it('is a no-op when every series is kept', () => {
    expect(capSeriesTo(base, ['A', 'B', 'C'])).toBe(base);
  });
});
