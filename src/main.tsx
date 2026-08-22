import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { queryClient } from './lib/queryClient';
import Root from './Root';
import { store } from './store';
import { AppProviders } from './AppProviders';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Root />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </AppProviders>
  </StrictMode>,
);
