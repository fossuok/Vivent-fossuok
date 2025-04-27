// src/app/dashboard/page.jsx
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-800 mb-2">Total Students</h2>
              <p className="text-3xl font-bold text-indigo-600">245</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Attendance Rate</h2>
              <p className="text-3xl font-bold text-green-600">78%</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">Emails Sent</h2>
              <p className="text-3xl font-bold text-purple-600">1,240</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <ul className="divide-y divide-gray-200">
                <li className="py-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">John Doe</span> was marked present
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                </li>
                <li className="py-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Workshop1</span> bulk import completed
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </li>
                <li className="py-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Email campaign</span> sent to 45 students
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
