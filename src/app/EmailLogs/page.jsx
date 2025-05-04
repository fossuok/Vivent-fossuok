'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ClipboardDocumentListIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import { API_URL_CONFIG } from '@/api/configs';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { addToast } = useToast();
  const { events } = useSelector((state) => state.event);

  // Fetch logs when button is clicked
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL_CONFIG.getEmailLogs, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setLogs([]);
          addToast("No logs found", TOAST_TYPES.INFO);
          setLoading(false);
          return;
        } else {
          throw new Error('Failed to fetch logs');
        }
      }

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError('Failed to fetch logs');
      addToast("Error fetching logs", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on initial render
  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const deleteEmailLogs = async () => {
    setShowConfirmDialog(false);
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(API_URL_CONFIG.deleteEmailLogs, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete logs');
      }

      setLogs([]);
      setSelectedLog(null);
      addToast("Logs deleted successfully", TOAST_TYPES.SUCCESS);
    } catch (err) {
      setError('Failed to delete logs');
      addToast("Error deleting logs", TOAST_TYPES.ERROR);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DashboardLayout>
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete All Email Logs"
        message="Are you sure you want to delete all email logs? This action cannot be undone and all campaign history will be permanently removed."
        confirmText="Delete All"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={deleteEmailLogs}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <ClipboardDocumentListIcon className="h-7 w-7 mr-2" />
                Email Campaign Logs
              </h1>
              <p className="mt-1 text-indigo-100">
                View the status and results of your email campaigns
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 transition flex items-center"
                disabled={loading}
              >
                <ArrowPathIcon className={`h-5 w-5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {logs.length > 0 && (
                <button
                  onClick={handleDeleteClick}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
                  disabled={isDeleting}
                >
                  <TrashIcon className="h-5 w-5 mr-1" />
                  {isDeleting ? 'Deleting...' : 'Clear Logs'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {error && (
            <div className="text-center text-red-600 py-4 bg-red-50 border-b border-red-100">{error}</div>
          )}

          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No email logs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Email logs will appear here after you send email campaigns.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logs List */}
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaigns</h3>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLog?.id === log.id 
                            ? 'bg-indigo-50 border-indigo-300' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {events.find((event) => event.id === log.event_id)?.title || 'Unknown Event'}
                            </p>
                            <p className="text-sm text-gray-500">From: {log.sender_name} ({log.sender_email})</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : ''}
                          </span>
                        </div>
                        <div className="mt-2 flex space-x-4">
                          <span className="text-sm text-green-600">
                            Sent: {log.success_count}/{log.success_count + log.failed_count}
                          </span>
                          {log.failed_count > 0 && (
                            <span className="text-sm text-red-600">
                              Failed: {log.failed_count}
                            </span>
                          )}
                        </div>
                        {(log.status === 'pending' || log.status === 'in_progress') && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.round((log.success_count / (log.success_count + log.failed_count)) * 100)}%` }}
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
                      <p className="text-sm text-gray-500">Event: <span className="font-medium text-gray-900">
                        {events.find((event) => event.id === selectedLog.event_id)?.title || 'Unknown Event'}
                      </span></p>
                      <p className="text-sm text-gray-500">Sender: <span className="font-medium text-gray-900">{selectedLog.sender_name} ({selectedLog.sender_email})</span></p>
                      <p className="text-sm text-gray-500">Started: <span className="font-medium text-gray-900">{selectedLog.sent_at ? new Date(selectedLog.sent_at).toLocaleString() : ''}</span></p>
                      {selectedLog.completed_at && (
                        <p className="text-sm text-gray-500">Completed: <span className="font-medium text-gray-900">{new Date(selectedLog.completed_at).toLocaleString()}</span></p>
                      )}
                      <p className="text-sm text-gray-500">Status: <span className="font-medium text-gray-900">{selectedLog.status}</span></p>
                      <p className="text-sm text-gray-500">Recipients: <span className="font-medium text-gray-900">{selectedLog.success_count+selectedLog.failed_count}</span></p>
                      <p className="text-sm text-gray-500">Successful: <span className="font-medium text-green-600">{selectedLog.success_count}</span></p>
                      <p className="text-sm text-gray-500">Failed: <span className="font-medium text-red-600">{selectedLog.failed_count}</span></p>
                    </div>
                    {selectedLog.failed_recipient_ids && selectedLog.failed_recipient_ids.length > 0 && (
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
                              {selectedLog.failed_recipient_ids.map((recipient, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 text-sm text-gray-900">{recipient}</td>
                                  <td className="px-3 py-2 text-sm text-red-600">Failed to send</td>
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
