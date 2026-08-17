import { createContext, use, type ReactNode } from 'react';

import type { HttpClient } from './http';
import type { DeviceProvider } from './types';

/**
 * The composition-root seam for the app's transport and device provider.
 * Components and hooks reach these through useHttp()/useDeviceProvider(); the
 * concrete instances are built once at the root (main.tsx) and injected here,
 * so no module holds ambient transport state, a future home-ui can swap in a
 * multi-vendor registry, and tests can inject fakes — without touching a call
 * site. This module deliberately imports no concrete implementation.
 */
export interface Services {
  http: HttpClient;
  deviceProvider: DeviceProvider;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext value={services}>{children}</ServicesContext>;
}

function useServices(): Services {
  const services = use(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return services;
}

export function useHttp(): HttpClient {
  return useServices().http;
}

export function useDeviceProvider(): DeviceProvider {
  return useServices().deviceProvider;
}
