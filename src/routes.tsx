import { createBrowserRouter } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { DeviceDetailPage } from '@/features/device-detail/DeviceDetailPage';
import { DevicesPage } from '@/features/devices/DevicesPage';
import { EnergyPage } from '@/features/energy/EnergyPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DevicesPage /> },
      { path: 'devices/:deviceId', element: <DeviceDetailPage /> },
      { path: 'energy', element: <EnergyPage /> },
    ],
  },
]);
