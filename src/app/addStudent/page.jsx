'use client';
import AddStudentForm from '@/components/AddStudentForm';
import { useRouter } from 'next/navigation';

export default function AddStudentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Add New Student
        </h1>
        <AddStudentForm
          onAdd={() => {
            router.push('/dashboard');
          }}
        />
      </div>
    </div>
  );
}
