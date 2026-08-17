import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './http';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 4xx are client/auth errors that won't heal on retry; everything else
      // gets a couple of attempts. Typed on ApiError rather than shape-sniffing.
      retry: (failureCount, error) =>
        error instanceof ApiError && error.status >= 400 && error.status < 500
          ? false
          : failureCount < 2,
      staleTime: 5_000,
    },
  },
});
