'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useToast, TOAST_TYPES } from '@/components/ToastContext';

export default function EmailLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/email-logs');
        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
        addToast('Failed to load email logs', TOAST_TYPES.ERROR);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
    
    // Poll for updates every 5 seconds if there are in-progress campaigns
    const hasInProgress = logs.some(log => log.status === 'pending' || log.status === 'in_progress');
    
    if (hasInProgress) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [logs]);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </Link>
              <h2 className="text-xl font-semibold text-gray-800">Email Campaign Logs</h2>
            </div>
            <Link 
              href="/send-email" 
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
            >
              New Campaign
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No email campaigns found</h3>
              <p className="mt-1 text-sm text-gray-500">Start a new campaign to see logs here.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaigns</h3>
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
                            <p className="font-medium text-gray-900">
                              {log.workshop.charAt(0).toUpperCase() + log.workshop.slice(1)} Campaign
                            </p>
                            <p className="text-sm text-gray-500">From: {log.senderName} ({log.senderEmail})</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 mb-1">
                              {new Date(log.startedAt).toLocaleString()}
                            </span>
                            {getStatusBadge(log.status)}
                          </div>
                        </div>
                        <div className="mt-2 flex space-x-4">
                          <span className="text-sm text-green-600">
                            Sent: {log.successCount}/{log.recipientCount}
                          </span>
                          {log.failedCount > 0 && (
                            <span className="text-sm text-red-600">
                              Failed: {log.failedCount}
                            </span>
                          )}
                        </div>
                        {(log.status === 'pending' || log.status === 'in_progress') && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.round((log.successCount / log.recipientCount) * 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedLog && (
                  <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Workshop: <span className="font-medium text-gray-900">{selectedLog.workshop}</span></p>
                      <p className="text-sm text-gray-500">Sender: <span className="font-medium text-gray-900">{selectedLog.senderName} ({selectedLog.senderEmail})</span></p>
                      <p className="text-sm text-gray-500">Started: <span className="font-medium text-gray-900">{new Date(selectedLog.startedAt).toLocaleString()}</span></p>
                      {selectedLog.completedAt && (
                        <p className="text-sm text-gray-500">Completed: <span className="font-medium text-gray-900">{new Date(selectedLog.completedAt).toLocaleString()}</span></p>
                      )}
                      <p className="text-sm text-gray-500">Status: <span className="font-medium text-gray-900">{selectedLog.status}</span></p>
                      <p className="text-sm text-gray-500">Recipients: <span className="font-medium text-gray-900">{selectedLog.recipientCount}</span></p>
                      <p className="text-sm text-gray-500">Successful: <span className="font-medium text-green-600">{selectedLog.successCount}</span></p>
                      <p className="text-sm text-gray-500">Failed: <span className="font-medium text-red-600">{selectedLog.failedCount}</span></p>
                    </div>
                    
                    {selectedLog.failedRecipients && selectedLog.failedRecipients.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Failed Recipients</h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedLog.failedRecipients.map((recipient, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 text-sm text-gray-900">{recipient.email}</td>
                                  <td className="px-3 py-2 text-sm text-red-600">{recipient.error}</td>
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
    </div>
  );
}
