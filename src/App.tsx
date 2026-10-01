import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { AppRoutes } from './routes';

// Initialize TanStack Query Client with sensible caching defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Sự cố khởi tạo School News Platform">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfigProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
