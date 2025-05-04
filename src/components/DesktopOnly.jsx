// src/components/DesktopOnly.jsx
"use client";
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

export default function DesktopOnly({ children }) {
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    setIsMobileView(isMobile);
    
    // Add resize listener to handle window resizing
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <svg 
            className="mx-auto h-16 w-16 text-indigo-600 mb-4"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Desktop View Required
          </h1>
          <p className="text-gray-600 mb-4">
            This event management system requires a larger screen for the best experience.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
            <p className="text-indigo-800 text-sm">
              Please access this application from a desktop or laptop computer to use all features properly.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Minimum recommended screen width: 768px
          </p>
        </div>
      </div>
    );
  }

  return children;
}
