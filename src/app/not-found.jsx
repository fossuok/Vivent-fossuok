// src/app/not-found.jsx
'use client';
import { useRouter } from 'next/navigation';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';

export default function NotFoundPage() {
  const router = useRouter();
  
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="bg-indigo-100 p-6 rounded-full mb-6">
          <QuestionMarkCircleIcon className="h-20 w-20 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
