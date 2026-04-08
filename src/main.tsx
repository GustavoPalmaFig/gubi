import './i18n';
import './index.css';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import localforage from 'localforage';
import { mantineTheme } from './theme/mantine-theme';
import { router } from './routes/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5min
      gcTime: 1000 * 60 * 60 * 24, // 24h
      refetchOnWindowFocus: false,
      retry: 2
    },
    mutations: {
      retry: false
    }
  }
});

const persister = createAsyncStoragePersister({
  storage: localforage
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element not found');

const root = createRoot(rootEl);

root.render(
  <StrictMode>
    <MantineProvider theme={mantineTheme}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </PersistQueryClientProvider>
    </MantineProvider>
  </StrictMode>
);
