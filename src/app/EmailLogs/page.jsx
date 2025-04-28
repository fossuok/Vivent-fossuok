'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState(null);

  // Fetch logs when button is clicked
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/email-logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on initial render
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ClipboardDocumentListIcon className="h-7 w-7 mr-2" />
              Email Campaign Logs
            </h1>
            <p className="mt-1 text-indigo-100">
              View the status and results of your email campaigns
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {error && (
            <div className="text-center text-red-600 py-4">{error}</div>
          )}

          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500">
                No logs loaded. Click <span className="font-semibold">Refresh Logs</span> to load.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logs List */}
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
                              {log.workshop?.charAt(0).toUpperCase() + log.workshop?.slice(1) || 'Campaign'}
                            </p>
                            <p className="text-sm text-gray-500">From: {log.senderName} ({log.senderEmail})</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {log.startedAt ? new Date(log.startedAt).toLocaleString() : ''}
                          </span>
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
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            log.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Selected Log Details */}
                {selectedLog && (
                  <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Workshop: <span className="font-medium text-gray-900">{selectedLog.workshop}</span></p>
                      <p className="text-sm text-gray-500">Sender: <span className="font-medium text-gray-900">{selectedLog.senderName} ({selectedLog.senderEmail})</span></p>
                      <p className="text-sm text-gray-500">Started: <span className="font-medium text-gray-900">{selectedLog.startedAt ? new Date(selectedLog.startedAt).toLocaleString() : ''}</span></p>
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
