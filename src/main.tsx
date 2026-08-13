import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { DeviceProviderProvider } from '@/api/provider';
import { queryClient } from '@/api/queryClient';
import { tplinkProvider } from '@/api/tplink';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@/routes';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {/* The app's one vendor-provider choice, made at the composition root */}
        <DeviceProviderProvider provider={tplinkProvider}>
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </DeviceProviderProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
