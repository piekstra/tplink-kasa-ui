import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDeviceProvider } from './services';
import type { Device, PowerAction } from './types';

const REFETCH = {
  devices: 15_000,
  currentPower: 10_000,
  energy: 5 * 60_000,
} as const;

/** Optimistic next state for a toggle, preserving the unknown (null) tri-state. */
function nextIsOn(current: boolean | null, action: PowerAction): boolean | null {
  if (action === 'toggle') return current === null ? null : !current;
  return action === 'on';
}

export function useDevices() {
  const provider = useDeviceProvider();
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => provider.listDevices(),
    refetchInterval: REFETCH.devices,
    refetchIntervalInBackground: false,
  });
}

export function useDevice(id: string) {
  const provider = useDeviceProvider();
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => provider.getDevice(id),
  });
}

export function usePowerAction() {
  const provider = useDeviceProvider();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: PowerAction }) =>
      provider.setPower(id, action),
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: ['devices'] });
      const previous = queryClient.getQueryData<Device[]>(['devices']);
      queryClient.setQueryData<Device[]>(['devices'], (devices) =>
        devices?.map((device) =>
          device.id === id ? { ...device, isOn: nextIsOn(device.isOn, action) } : device,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['devices'], context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useCurrentPower(nameFilter?: string) {
  const provider = useDeviceProvider();
  return useQuery({
    queryKey: ['power', 'current', nameFilter ?? ''],
    queryFn: () => provider.getCurrentPower(nameFilter),
    refetchInterval: REFETCH.currentPower,
    refetchIntervalInBackground: false,
  });
}

export function useDailyEnergy(nameFilter?: string) {
  const provider = useDeviceProvider();
  return useQuery({
    queryKey: ['power', 'day', nameFilter ?? ''],
    queryFn: () => provider.getDailyEnergy(nameFilter),
    refetchInterval: REFETCH.energy,
    staleTime: 60_000,
  });
}

export function useMonthlyEnergy(nameFilter?: string) {
  const provider = useDeviceProvider();
  return useQuery({
    queryKey: ['power', 'month', nameFilter ?? ''],
    queryFn: () => provider.getMonthlyEnergy(nameFilter),
    refetchInterval: REFETCH.energy,
    staleTime: 60_000,
  });
}
