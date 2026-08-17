import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { createHttpClient } from '@/api/http';
import { queryClient } from '@/api/queryClient';
import { ServicesProvider, type Services } from '@/api/services';
import { createTplinkProvider } from '@/api/tplink';
import { localStorageTokenStore } from '@/api/tokenStore';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@/routes';

import './index.css';

// The composition root: build the transport and the active vendor provider once,
// wire the token store in, and inject both through context. RequireAuth registers
// the 401 handler on the client; nothing else touches the transport directly.
const http = createHttpClient({ getToken: localStorageTokenStore.get });
const services: Services = {
  http,
  deviceProvider: createTplinkProvider(http),
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ServicesProvider services={services}>
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </ServicesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
