// src/app/importLogs/page.js
'use client';
import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';

export default function ImportLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/import-logs');
        const data = await response.json();
        setLogs(data.logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Import Logs</h1>
          <p className="mt-1 text-indigo-100">
            Advanced import logs for tracking bulk import activities.
          </p>
        </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Import Logs</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No import logs found</h3>
            <p className="mt-1 text-sm text-gray-500">Import logs will appear here after you perform bulk imports.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Imports</h3>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div 
                      key={log._id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLog?._id === log._id 
                          ? 'bg-indigo-50 border-indigo-300' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{log.fileName}</p>
                          <p className="text-sm text-gray-500">Workshop: {log.workshop}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex space-x-4">
                        <span className="text-sm text-green-600">
                          Imported: {log.successCount}
                        </span>
                        <span className="text-sm text-red-600">
                          Skipped: {log.skippedCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedLog && (
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Import Details</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">File: <span className="font-medium text-gray-900">{selectedLog.fileName}</span></p>
                    <p className="text-sm text-gray-500">Workshop: <span className="font-medium text-gray-900">{selectedLog.workshop}</span></p>
                    <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</span></p>
                    <p className="text-sm text-gray-500">Total Rows: <span className="font-medium text-gray-900">{selectedLog.totalRows}</span></p>
                  </div>
                  
                  {selectedLog.skippedCount > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skipped Entries</h4>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedLog.skippedRows.map((row, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-sm text-gray-900">{row.firstName} {row.lastName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">{row.email}</td>
                                <td className="px-3 py-2 text-sm text-red-600">{row.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
