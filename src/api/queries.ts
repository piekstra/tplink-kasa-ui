import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { provider } from './tplink';
import type { Device, PowerAction } from './types';

const REFETCH = {
  devices: 15_000,
  currentPower: 10_000,
  energy: 5 * 60_000,
} as const;

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => provider.listDevices(),
    refetchInterval: REFETCH.devices,
    refetchIntervalInBackground: false,
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => provider.getDevice(id),
  });
}

export function usePowerAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: PowerAction }) =>
      provider.setPower(id, action),
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: ['devices'] });
      const previous = queryClient.getQueryData<Device[]>(['devices']);
      queryClient.setQueryData<Device[]>(['devices'], (devices) =>
        devices?.map((device) =>
          device.id === id
            ? { ...device, isOn: action === 'toggle' ? !device.isOn : action === 'on' }
            : device,
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
  return useQuery({
    queryKey: ['power', 'current', nameFilter ?? ''],
    queryFn: () => provider.getCurrentPower(nameFilter),
    refetchInterval: REFETCH.currentPower,
    refetchIntervalInBackground: false,
  });
}

export function useDailyEnergy(nameFilter?: string) {
  return useQuery({
    queryKey: ['power', 'day', nameFilter ?? ''],
    queryFn: () => provider.getDailyEnergy(nameFilter),
    refetchInterval: REFETCH.energy,
    staleTime: 60_000,
  });
}

export function useMonthlyEnergy(nameFilter?: string) {
  return useQuery({
    queryKey: ['power', 'month', nameFilter ?? ''],
    queryFn: () => provider.getMonthlyEnergy(nameFilter),
    refetchInterval: REFETCH.energy,
    staleTime: 60_000,
  });
}
