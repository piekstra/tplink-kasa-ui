import { RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCurrentPower, useDevices } from '@/api/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DeviceCard } from './DeviceCard';

export function DevicesPage() {
  const devices = useDevices();
  const power = useCurrentPower();
  const [filter, setFilter] = useState('');

  const wattsByDevice = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const reading of power.data ?? []) {
      map.set(reading.deviceId, reading.watts);
    }
    return map;
  }, [power.data]);

  const visible = useMemo(() => {
    const all = devices.data ?? [];
    const needle = filter.trim().toLowerCase();
    const matched = needle
      ? all.filter((device) => device.name.toLowerCase().includes(needle))
      : all;
    return [...matched].sort((a, b) => a.name.localeCompare(b.name));
  }, [devices.data, filter]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter devices…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          onClick={() => void devices.refetch()}
          disabled={devices.isFetching}
        >
          <RefreshCw className={devices.isFetching ? 'size-4 animate-spin' : 'size-4'} />
        </Button>
      </div>

      {devices.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {devices.isError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load devices: {devices.error.message}
        </p>
      )}

      {devices.data && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {filter ? 'No devices match the filter.' : 'No devices found on this account.'}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((device) => (
          <DeviceCard key={device.id} device={device} watts={wattsByDevice.get(device.id)} />
        ))}
      </div>
    </div>
  );
}
