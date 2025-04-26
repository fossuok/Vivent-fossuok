'use client';
import AddStudentForm from '@/components/AddStudentForm';
import { useRouter } from 'next/navigation';

export default function AddStudentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Logo/Brand Element (Optional) */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        
        {/* Form Component */}
        <AddStudentForm
          onAdd={() => {
            router.push('/dashboard');
          }}
        />
        
        {/* Footer Element (Optional) */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All student data is securely stored and managed according to our privacy policy.</p>
        </div>
      </div>
    </div>
  );
}
