'use client';
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function ComingSoonPage() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  
  // Set release date - adjust as needed
  const releaseDate = new Date("May 31, 2025 00:00:00").getTime();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = releaseDate - now;
      
      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
      
      if (distance < 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-indigo-100">
            Setting up your preferences and configurations
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="mb-8">
              <ClockIcon className="h-20 w-20 text-indigo-500 mx-auto" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">COMING SOON</h2>
            <p className="text-lg text-gray-600 max-w-2xl mb-8">
              We're working hard to bring you advanced analytics features. Stay tuned for powerful insights into student attendance and engagement.
            </p>
            
            <div className="border-t border-b border-gray-200 py-6 w-full max-w-md mb-8">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{days}</div>
                  <div className="text-sm text-gray-500">Days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{hours}</div>
                  <div className="text-sm text-gray-500">Hours</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{minutes}</div>
                  <div className="text-sm text-gray-500">Minutes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{seconds}</div>
                  <div className="text-sm text-gray-500">Seconds</div>
                </div>
              </div>
            </div>
            
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
