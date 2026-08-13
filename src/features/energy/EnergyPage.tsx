import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCurrentPower, useDailyEnergy, useMonthlyEnergy } from '@/api/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { buildColorMap } from './charts/common';
import { CurrentPowerChart, usePowerHistory } from './charts/CurrentPowerChart';
import { EnergyBarChart } from './charts/EnergyBarChart';
import { chartView, powerView as buildPowerView, toEnergyRows } from './transform';

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

  const dailyView = useMemo(
    () => chartView(dailyData, filter, topSeries, SERIES_CAP),
    [dailyData, filter, topSeries],
  );
  const monthlyView = useMemo(
    () => chartView(monthlyData, filter, topSeries, SERIES_CAP),
    [monthlyData, filter, topSeries],
  );

  const powerViewData = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const names = (power.data ?? [])
      .filter((reading) => !query || reading.name.toLowerCase().includes(query))
      .map((reading) => reading.name);
    return buildPowerView(powerRows, names, ranking, SERIES_CAP);
  }, [powerRows, power.data, filter, ranking]);

  const isLoading = daily.isLoading || monthly.isLoading;
  const error = daily.error ?? monthly.error ?? power.error;

  return (
    <div className="grid gap-4">
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Filter devices"
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
              <CurrentPowerChart
                rows={powerViewData.rows}
                series={powerViewData.series}
                colors={colors}
              />
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
