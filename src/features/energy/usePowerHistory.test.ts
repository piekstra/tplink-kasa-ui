import { describe, expect, it } from 'vitest';

import type { PowerReading } from '@/api/types';
import { appendPowerRow } from './usePowerHistory';

function readings(entries: [string, number | null][]): PowerReading[] {
  return entries.map(([name, watts]) => ({ deviceId: name, name, watts }));
}

describe('appendPowerRow', () => {
  it('appends a timestamped row from finite readings', () => {
    const first = appendPowerRow([], readings([['Lamp', 10]]), 1000);
    expect(first).toEqual([{ time: 1000, Lamp: 10 }]);

    const second = appendPowerRow(first, readings([['Lamp', 12]]), 2000);
    expect(second).toEqual([
      { time: 1000, Lamp: 10 },
      { time: 2000, Lamp: 12 },
    ]);
  });

  it('drops null and non-finite readings', () => {
    const rows = appendPowerRow(
      [],
      readings([
        ['Lamp', null],
        ['Heater', 40],
      ]),
      5,
    );
    expect(rows).toEqual([{ time: 5, Heater: 40 }]);
  });

  it('caps the rolling window to maxPoints', () => {
    let rows = [{ time: 0 }];
    for (let i = 1; i <= 5; i++) {
      rows = appendPowerRow(rows, readings([['Lamp', i]]), i, 3);
    }
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.time)).toEqual([3, 4, 5]);
  });
});
