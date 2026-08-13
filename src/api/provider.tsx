import { createContext, use, type ReactNode } from 'react';

import type { DeviceProvider } from './types';

/**
 * The composition-root seam for the active device provider. Components and
 * hooks depend on the DeviceProvider interface via useDeviceProvider(); the
 * concrete choice is injected at the root (main.tsx) — a future home-ui swaps
 * in a multi-vendor registry, and a test injects a fake — without touching a
 * single call site. This module deliberately does not import any vendor
 * implementation, so the choice lives only at the root.
 */
const DeviceProviderContext = createContext<DeviceProvider | null>(null);

export function DeviceProviderProvider({
  provider,
  children,
}: {
  provider: DeviceProvider;
  children: ReactNode;
}) {
  return <DeviceProviderContext value={provider}>{children}</DeviceProviderContext>;
}

export function useDeviceProvider(): DeviceProvider {
  const provider = use(DeviceProviderContext);
  if (!provider) {
    throw new Error('useDeviceProvider must be used within a DeviceProviderProvider');
  }
  return provider;
}
