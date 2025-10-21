'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            refetchOnMount: true, // Refetch on mount if data is stale or invalidated
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: 1, // Only retry failed requests once
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
