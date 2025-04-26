'use client';
import { useState } from 'react';
import useSWR from 'swr';
import StudentList from '@/components/StudentList';
import Link from 'next/link';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function Dashboard() {
  const { data: students } = useSWR('/api/Students', fetcher);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students?.filter(student => {
    // Guard against null/undefined searchTerm
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const firstName = student?.firstName?.toLowerCase() || '';
    const lastName = student?.lastName?.toLowerCase() || '';
    const email = student?.email?.toLowerCase() || '';
    
    return firstName.includes(term) || 
           lastName.includes(term) || 
           email.includes(term);
  });  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-8 md:py-10">
            <h1 className="text-3xl font-bold text-white">Student Attendance Dashboard</h1>
            <p className="mt-2 text-indigo-100">Manage student attendance for summit workshops</p>
          </div>
          
          {/* Action Bar */}
          <div className="border-b border-gray-200 px-6 py-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link 
              href="/addStudent" 
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg shadow-sm hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add New Student
            </Link>
            
            <div className="relative rounded-md shadow-sm max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            {!students ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
              </div>
            ) : (
              <StudentList students={filteredStudents} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
