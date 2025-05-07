// src/components/Providers.jsx
"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { ToastProvider } from "@/components/ToastContext";
import { NetworkProvider } from "./NetworkProvider";

export default function Providers({ children }) {
  return (
    <NetworkProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ToastProvider>{children}</ToastProvider>
        </PersistGate>
      </Provider>
    </NetworkProvider>
  );
}
