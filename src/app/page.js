// src/app/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // If authenticated, go to dashboard, otherwise to login
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/Login');
    }
  }, [isAuthenticated, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="text-center">
        <div className="animate-bounce mb-4">
          <svg 
            className="mx-auto h-16 w-16 text-indigo-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Event Management System</h1>
        <p className="text-gray-600 mb-6">Redirecting...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    </div>
  );
}
