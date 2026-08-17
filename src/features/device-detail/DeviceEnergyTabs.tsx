import { useMemo } from 'react';

import { useDailyEnergy, useMonthlyEnergy } from '@/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SERIES_COLORS } from '@/features/energy/charts/common';
import { EnergyBarChart } from '@/features/energy/charts/EnergyBarChart';
import { toEnergyRows } from '@/features/energy/transform';

/** Day/month energy history for a single emeter device. */
export function DeviceEnergyTabs({ deviceId, name }: { deviceId: string; name: string }) {
  const daily = useDailyEnergy();
  const monthly = useMonthlyEnergy();

  const dailyData = useMemo(
    () =>
      toEnergyRows(
        (daily.data ?? []).filter((d) => d.deviceId === deviceId),
        'day',
      ),
    [daily.data, deviceId],
  );
  const monthlyData = useMemo(
    () =>
      toEnergyRows(
        (monthly.data ?? []).filter((d) => d.deviceId === deviceId),
        'month',
      ),
    [monthly.data, deviceId],
  );

  const colors = useMemo(() => new Map([[name, SERIES_COLORS[0]]]), [name]);

  if (daily.isLoading || monthly.isLoading) {
    return <Skeleton className="h-72 rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Energy use (kWh)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day">
          <TabsList>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="day">
            <EnergyBarChart data={dailyData} granularity="day" colors={colors} showLegend={false} />
          </TabsContent>
          <TabsContent value="month">
            <EnergyBarChart
              data={monthlyData}
              granularity="month"
              colors={colors}
              showLegend={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
