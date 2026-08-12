import { ArrowLeft, WifiOff } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { useDevice } from '@/api/queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DeviceEnergyTabs } from './DeviceEnergyTabs';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-mono">{value}</span>
    </div>
  );
}

export function DeviceDetailPage() {
  const { deviceId } = useParams<'deviceId'>();
  const device = useDevice(deviceId!);

  if (device.isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (device.isError || !device.data) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load this device{device.error ? `: ${device.error.message}` : ''}.
      </p>
    );
  }

  const detail = device.data;
  const interesting = ['sw_ver', 'hw_ver', 'mac', 'on_time', 'led_off', 'rssi'];
  const raw = detail.raw ?? {};

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold">{detail.name}</h1>
        <Badge variant="secondary">{detail.model}</Badge>
        {!detail.isOnline && (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <WifiOff className="size-4" /> offline
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Device info</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="State" value={detail.isOn === null ? '—' : detail.isOn ? 'On' : 'Off'} />
          <InfoRow label="Kind" value={detail.kind} />
          {detail.rssi !== null && <InfoRow label="Wi-Fi signal" value={`${detail.rssi} dBm`} />}
          {interesting
            .filter((key) => raw[key] !== undefined && raw[key] !== null)
            .map((key) => (
              <InfoRow key={key} label={key} value={String(raw[key])} />
            ))}
        </CardContent>
      </Card>

      {detail.capabilities.emeter && <DeviceEnergyTabs deviceId={detail.id} name={detail.name} />}
    </div>
  );
}
