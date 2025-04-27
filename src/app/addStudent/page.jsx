'use client';
import AddStudentForm from '@/components/AddStudentForm';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function AddStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workshop = searchParams.get('workshop') || 'default';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Add New Student</h1>
          <p className="mt-1 text-indigo-100">
            Add a student to the {workshop.charAt(0).toUpperCase() + workshop.slice(1)} workshop
          </p>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            {/* Brand Element */}
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            
            {/* Form Component */}
            <AddStudentForm
              workshop={workshop}
              onAdd={() => {
                router.push(`/students?workshop=${workshop}`);
              }}
            />
            
            {/* Footer Element */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>All student data is securely stored and managed according to our privacy policy.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
