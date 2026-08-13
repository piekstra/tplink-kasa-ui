import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { DeviceProviderProvider } from '@/api/provider';
import { queryClient } from '@/api/queryClient';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@/routes';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <DeviceProviderProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </DeviceProviderProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
