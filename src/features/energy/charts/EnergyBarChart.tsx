import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { EnergySeriesData } from '../transform';
import { AXIS_TICK, ChartTooltip, colorFor, DataTable, GRID_STROKE } from './common';

const dayFormat = new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric' });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' });
const dayLongFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
const monthLongFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

export function EnergyBarChart({
  data,
  granularity,
  colors,
  showLegend = true,
}: {
  data: EnergySeriesData;
  granularity: 'day' | 'month';
  colors: Map<string, string>;
  showLegend?: boolean;
}) {
  const tickFor = (time: number) =>
    (granularity === 'day' ? dayFormat : monthFormat).format(new Date(time));
  const labelFor = (time: number) =>
    (granularity === 'day' ? dayLongFormat : monthLongFormat).format(new Date(time));

  if (data.rows.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No energy data yet.</p>;
  }

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.rows} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="time"
              tickFormatter={tickFor}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
            />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={<ChartTooltip unit="kWh" labelText={(l) => labelFor(Number(l))} />}
            />
            {showLegend && data.series.length > 1 && (
              <Legend
                iconType="square"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            )}
            {data.series.map((name, index) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="energy"
                fill={colorFor(colors, name)}
                // hairline gap between stacked segments, in surface color
                stroke="var(--card)"
                strokeWidth={1}
                radius={index === data.series.length - 1 ? [3, 3, 0, 0] : 0}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable rows={data.rows} series={data.series} labelFor={labelFor} unit="kWh" />
    </div>
  );
}
