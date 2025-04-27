// src/app/layout.jsx
'use client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { ToastProvider } from '@/components/ToastContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
