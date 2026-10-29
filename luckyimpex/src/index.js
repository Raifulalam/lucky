import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render without StrictMode in development to avoid double renders
if (process.env.NODE_ENV === 'development') {
  root.render(
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </QueryClientProvider>
  );
} else {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Service worker disabled to prevent blank page issues
// Uncomment if you want to enable PWA features after proper testing
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// if (process.env.NODE_ENV === 'production') {
//   serviceWorkerRegistration.register();
// }

// Measure web vitals
reportWebVitals();
