import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Auth and client errors won't heal on retry
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || (status >= 400 && status < 500)) return false;
        }
        return failureCount < 2;
      },
      staleTime: 5_000,
    },
  },
});
