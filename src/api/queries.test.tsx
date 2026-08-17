import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { HttpClient } from './http';
import { ServicesProvider } from './services';
import { usePowerAction } from './queries';
import type { Device, DeviceProvider } from './types';

const noopHttp = {
  get: async () => ({}),
  post: async () => ({}),
  setOnUnauthorized: () => {},
} as unknown as HttpClient;

function makeDevice(over: Partial<Device> = {}): Device {
  return {
    id: 'a',
    vendor: 'tplink',
    name: 'Lamp',
    model: 'HS110(US)',
    kind: 'plug',
    isOnline: true,
    isOn: false,
    capabilities: { switchable: true, emeter: true },
    rssi: -50,
    ...over,
  };
}

function setup(overrides: Partial<DeviceProvider>, seed: Device[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(['devices'], seed);
  const provider = {
    vendor: 'tplink',
    listDevices: async () => seed,
    ...overrides,
  } as DeviceProvider;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ServicesProvider services={{ http: noopHttp, deviceProvider: provider }}>
        {children}
      </ServicesProvider>
    </QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function devices(queryClient: QueryClient): Device[] {
  return queryClient.getQueryData<Device[]>(['devices']) ?? [];
}

describe('usePowerAction', () => {
  it('optimistically flips isOn and calls the provider', async () => {
    const setPower = vi.fn().mockResolvedValue({ deviceId: 'a', isOn: true });
    const { queryClient, wrapper } = setup({ setPower }, [makeDevice({ isOn: false })]);

    const { result } = renderHook(() => usePowerAction(), { wrapper });
    result.current.mutate({ id: 'a', action: 'on' });

    await waitFor(() => expect(devices(queryClient)[0].isOn).toBe(true));
    expect(setPower).toHaveBeenCalledWith('a', 'on');
  });

  it('preserves the unknown (null) state on a toggle', async () => {
    const setPower = vi.fn().mockResolvedValue({ deviceId: 'a', isOn: null });
    const { queryClient, wrapper } = setup({ setPower }, [makeDevice({ isOn: null })]);

    const { result } = renderHook(() => usePowerAction(), { wrapper });
    result.current.mutate({ id: 'a', action: 'toggle' });

    await waitFor(() => expect(setPower).toHaveBeenCalled());
    // null must not be painted as ON while the request is in flight
    expect(devices(queryClient)[0].isOn).toBeNull();
  });

  it('rolls back the optimistic change when the provider fails', async () => {
    const setPower = vi.fn().mockRejectedValue(new Error('offline'));
    const { queryClient, wrapper } = setup({ setPower }, [makeDevice({ isOn: false })]);

    const { result } = renderHook(() => usePowerAction(), { wrapper });
    result.current.mutate({ id: 'a', action: 'on' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(devices(queryClient)[0].isOn).toBe(false);
  });
});
