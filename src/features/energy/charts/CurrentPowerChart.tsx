import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { PowerRow } from '../transform';
import { AXIS_TICK, ChartTooltip, colorFor, DataTable, GRID_STROKE } from './common';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

export function CurrentPowerChart({
  rows,
  series,
  colors,
}: {
  rows: PowerRow[];
  series: string[];
  colors: Map<string, string>;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Collecting live readings… the chart fills as data arrives.
      </p>
    );
  }

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(t) => timeFormat.format(new Date(t))}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
            />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              content={
                <ChartTooltip unit="W" labelText={(l) => timeFormat.format(new Date(Number(l)))} />
              }
            />
            {series.length > 1 && (
              <Legend
                iconType="square"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            )}
            {series.map((name) => (
              <Line
                key={name}
                dataKey={name}
                stroke={colorFor(colors, name)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DataTable
        rows={rows}
        series={series}
        labelFor={(time) => timeFormat.format(new Date(time))}
        unit="W"
      />
    </div>
  );
}
