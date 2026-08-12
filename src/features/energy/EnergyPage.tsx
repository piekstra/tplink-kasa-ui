import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCurrentPower, useDailyEnergy, useMonthlyEnergy } from '@/api/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { buildColorMap } from './charts/common';
import { CurrentPowerChart, usePowerHistory } from './charts/CurrentPowerChart';
import { EnergyBarChart } from './charts/EnergyBarChart';
import { capSeriesTo, filterSeries, OTHER_SERIES, toEnergyRows } from './transform';

const SERIES_CAP = 4;

export function EnergyPage() {
  const [filter, setFilter] = useState('');
  const daily = useDailyEnergy();
  const monthly = useMonthlyEnergy();
  const power = useCurrentPower();
  const powerRows = usePowerHistory(power.data);

  const dailyData = useMemo(() => toEnergyRows(daily.data ?? [], 'day'), [daily.data]);
  const monthlyData = useMemo(() => toEnergyRows(monthly.data ?? [], 'month'), [monthly.data]);

  // One global ranking (largest time window) drives color assignment and the
  // fold-to-Other list for every chart, so a device keeps its color everywhere
  // and a filter never repaints the survivors.
  const ranking = useMemo(
    () => (monthlyData.series.length ? monthlyData.series : dailyData.series),
    [monthlyData, dailyData],
  );
  const topSeries = useMemo(() => ranking.slice(0, SERIES_CAP), [ranking]);
  const colors = useMemo(() => buildColorMap(ranking), [ranking]);

  // When a filter narrows things down to a handful of devices, show them as
  // themselves; only unfiltered views fold the long tail into "Other".
  const viewFor = (data: typeof dailyData) => {
    const filtered = filterSeries(data, filter);
    return filtered.series.length <= SERIES_CAP ? filtered : capSeriesTo(filtered, topSeries);
  };
  const dailyView = useMemo(() => viewFor(dailyData), [dailyData, filter, topSeries]); // eslint-disable-line react-hooks/exhaustive-deps
  const monthlyView = useMemo(() => viewFor(monthlyData), [monthlyData, filter, topSeries]); // eslint-disable-line react-hooks/exhaustive-deps

  const powerView = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const names = new Set<string>();
    for (const reading of power.data ?? []) {
      if (query && !reading.name.toLowerCase().includes(query)) continue;
      names.add(reading.name);
    }
    const byRank = (a: string, b: string) => {
      const rank = (n: string) => {
        const i = ranking.indexOf(n);
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
      };
      return rank(a) - rank(b) || a.localeCompare(b);
    };

    if (names.size <= SERIES_CAP) {
      return { rows: powerRows, series: [...names].sort(byRank) };
    }

    const keep = [...names].filter((n) => topSeries.includes(n)).sort(byRank);
    const fold = [...names].filter((n) => !topSeries.includes(n));
    const rows = powerRows.map((row) => {
      const out: { time: number; [key: string]: number } = { time: row.time };
      for (const name of keep) {
        if (row[name] !== undefined) out[name] = row[name];
      }
      let other = 0;
      let sawAny = false;
      for (const name of fold) {
        if (row[name] !== undefined) {
          other += row[name];
          sawAny = true;
        }
      }
      if (sawAny) out[OTHER_SERIES] = Math.round(other * 100) / 100;
      return out;
    });
    return { rows, series: [...keep, OTHER_SERIES] };
  }, [powerRows, power.data, filter, ranking, topSeries]);

  const isLoading = daily.isLoading || monthly.isLoading;
  const error = daily.error ?? monthly.error ?? power.error;

  return (
    <div className="grid gap-4">
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter devices…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-8"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">Couldn&apos;t load energy data: {error.message}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live power</CardTitle>
              <CardDescription>Instantaneous draw in watts, sampled every 10s</CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentPowerChart rows={powerView.rows} series={powerView.series} colors={colors} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily energy</CardTitle>
              <CardDescription>kWh per day, this month and last</CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyBarChart data={dailyView} granularity="day" colors={colors} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly energy</CardTitle>
              <CardDescription>kWh per month, this year and last</CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyBarChart data={monthlyView} granularity="month" colors={colors} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
