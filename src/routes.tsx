import { createBrowserRouter } from 'react-router';

import { RouteError } from '@/components/RouteError';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { DeviceDetailPage } from '@/features/device-detail/DeviceDetailPage';
import { DevicesPage } from '@/features/devices/DevicesPage';
import { EnergyPage } from '@/features/energy/EnergyPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteError /> },
  {
    path: '/',
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DevicesPage />, errorElement: <RouteError /> },
          {
            path: 'devices/:deviceId',
            element: <DeviceDetailPage />,
            errorElement: <RouteError />,
          },
          { path: 'energy', element: <EnergyPage />, errorElement: <RouteError /> },
        ],
      },
    ],
  },
]);
