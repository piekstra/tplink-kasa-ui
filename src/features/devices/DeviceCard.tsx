import { WifiOff, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { usePowerAction } from '@/api/queries';
import type { Device } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const KIND_LABELS: Record<Device['kind'], string> = {
  plug: 'Plug',
  strip: 'Power strip',
  'strip-outlet': 'Outlet',
  bulb: 'Bulb',
  switch: 'Switch',
  unknown: 'Device',
};

export function DeviceCard({ device, watts }: { device: Device; watts?: number | null }) {
  const powerAction = usePowerAction();

  const handleToggle = (checked: boolean) => {
    powerAction.mutate(
      { id: device.id, action: checked ? 'on' : 'off' },
      {
        onError: (error) =>
          toast.error(`Couldn't switch ${device.name}`, { description: error.message }),
      },
    );
  };

  const canSwitch = device.isOnline && device.capabilities.switchable && device.isOn !== null;

  return (
    <Card
      className={cn('transition-opacity', !device.isOnline && 'opacity-60')}
      data-testid={`device-${device.id}`}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`/devices/${encodeURIComponent(device.id)}`}
            className="block truncate font-medium hover:underline"
          >
            {device.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
              {KIND_LABELS[device.kind]}
            </Badge>
            <span>{device.model.replace(/\(.*\)$/, '')}</span>
            {!device.isOnline && (
              <span className="flex items-center gap-1 text-destructive">
                <WifiOff className="size-3" /> offline
              </span>
            )}
            {device.isOnline && watts != null && (
              <span className="flex items-center gap-0.5 font-medium text-foreground">
                <Zap className="size-3" />
                {watts >= 100 ? Math.round(watts) : watts.toFixed(1)} W
              </span>
            )}
          </div>
        </div>
        {device.capabilities.switchable && (
          <Switch
            checked={device.isOn === true}
            disabled={!canSwitch || powerAction.isPending}
            onCheckedChange={handleToggle}
            aria-label={`Turn ${device.name} ${device.isOn ? 'off' : 'on'}`}
          />
        )}
      </CardContent>
    </Card>
  );
}
