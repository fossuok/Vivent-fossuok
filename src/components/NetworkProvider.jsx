import React, { createContext, useState, useEffect, useContext } from "react";
import { API_URL_CONFIG } from "@/api/configs";

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true); // Default to `true` for SSR

  const checkInternetConnection = async () => {
    try {
      // Ping a reliable endpoint to check connectivity
      const response = await fetch(API_URL_CONFIG.connection, {
        method: "GET",
        cache: "no-store",
      });
      setIsOnline(response.ok);
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure this only runs in the browser

    // Initial connectivity check
    checkInternetConnection();

    const handleOnline = () => {
      setIsOnline(true);
      checkInternetConnection(); // Double-check connectivity
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    // Render a fallback UI when offline
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            You are offline. Please check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);