import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider, dehydrate, hydrate } from '@tanstack/react-query';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const QUERY_PERSIST_KEY = "lucky-query-cache-v1";
const PERSISTED_QUERY_TTL = 15 * 60 * 1000;
const PUBLIC_QUERY_ROOTS = new Set(["products", "product", "mobile-products", "mobile-product", "brand-products", "categories"]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (garbage collection time - react query v5 uses gcTime instead of cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const loadPersistedQueryState = () => {
  try {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(QUERY_PERSIST_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (!payload?.savedAt || !payload?.state) return null;

    if (Date.now() - payload.savedAt > PERSISTED_QUERY_TTL) {
      window.localStorage.removeItem(QUERY_PERSIST_KEY);
      return null;
    }

    return payload.state;
  } catch {
    return null;
  }
};

const persistQueryState = () => {
  if (typeof window === "undefined") return () => {};

  let timeoutId = null;

  const schedulePersist = () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      try {
        const dehydratedState = dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => PUBLIC_QUERY_ROOTS.has(String(query.queryKey?.[0] || "")),
        });

        window.localStorage.setItem(
          QUERY_PERSIST_KEY,
          JSON.stringify({
            savedAt: Date.now(),
            state: dehydratedState,
          })
        );
      } catch {
        // Ignore persistence failures on constrained storage environments.
      }
    }, 400);
  };

  const unsubscribe = queryClient.getQueryCache().subscribe(schedulePersist);
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      schedulePersist();
    }
  };

  window.addEventListener("beforeunload", schedulePersist);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.clearTimeout(timeoutId);
    unsubscribe();
    window.removeEventListener("beforeunload", schedulePersist);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
};

const persistedState = loadPersistedQueryState();
if (persistedState) {
  hydrate(queryClient, persistedState);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Register the PWA service worker
serviceWorkerRegistration.register();
persistQueryState();

// Measure web vitals
reportWebVitals();
