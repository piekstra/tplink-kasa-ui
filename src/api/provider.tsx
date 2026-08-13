import { createContext, use, type ReactNode } from 'react';

import { tplinkProvider } from './tplink';
import type { DeviceProvider } from './types';

/**
 * The composition-root seam for the active device provider. Components and
 * hooks depend on the DeviceProvider interface via useDeviceProvider(); the
 * concrete choice is injected here (tplink today), and a future home-ui swaps
 * in a multi-vendor registry — or a test injects a fake — without touching a
 * single call site.
 */
const DeviceProviderContext = createContext<DeviceProvider>(tplinkProvider);

export function DeviceProviderProvider({
  provider = tplinkProvider,
  children,
}: {
  provider?: DeviceProvider;
  children: ReactNode;
}) {
  return <DeviceProviderContext value={provider}>{children}</DeviceProviderContext>;
}

export function useDeviceProvider(): DeviceProvider {
  return use(DeviceProviderContext);
}
