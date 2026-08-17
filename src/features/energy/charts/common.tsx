import type { TooltipContentProps } from 'recharts';

/** Fixed categorical slots (validated); assignments follow the entity, never its rank. */
export const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
];

export const OTHER_COLOR = 'var(--chart-other)';

/** Stable series -> color map built once from the full (unfiltered) series order. */
export function buildColorMap(series: string[]): Map<string, string> {
  const map = new Map<string, string>();
  series.slice(0, SERIES_COLORS.length).forEach((name, i) => map.set(name, SERIES_COLORS[i]));
  return map;
}

export function colorFor(map: Map<string, string>, name: string): string {
  return map.get(name) ?? OTHER_COLOR;
}

export const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11 } as const;
export const GRID_STROKE = 'var(--border)';

/* Recharts injects the tooltip state props at render time */
interface ChartTooltipProps extends Partial<TooltipContentProps<number, string>> {
  labelText?: (label: unknown) => string;
  unit: string;
}

export function ChartTooltip({ active, payload, label, labelText, unit }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const shown = [...payload].filter((entry) => entry.value !== undefined).reverse();
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">
        {labelText ? labelText(label) : String(label)}
      </p>
      <div className="grid gap-0.5">
        {shown.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: entry.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-3 font-mono tabular-nums text-popover-foreground">
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Relief for the light-surface contrast WARN: an always-available table view. */
export function DataTable({
  rows,
  series,
  labelFor,
  unit,
}: {
  rows: { time: number; [key: string]: number }[];
  series: string[];
  labelFor: (time: number) => string;
  unit: string;
}) {
  if (rows.length === 0) return null;
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
        View data table
      </summary>
      <div className="mt-2 max-h-56 overflow-auto rounded-md border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="px-2 py-1 text-left font-medium"></th>
              {series.map((name) => (
                <th key={name} className="px-2 py-1 text-right font-medium">
                  {name} ({unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.time} className="border-t">
                <td className="px-2 py-1 text-muted-foreground">{labelFor(row.time)}</td>
                {series.map((name) => (
                  <td key={name} className="px-2 py-1 text-right font-mono tabular-nums">
                    {(row[name] ?? 0).toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
