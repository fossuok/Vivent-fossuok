'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { DocumentArrowUpIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useToast, TOAST_TYPES } from '@/components/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL_CONFIG } from '@/api/configs';

export default function BulkUploadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { events } = useSelector((state) => state.event);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [event, setEvent] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    if (!eventId) {
      setEvent(null);
      return;
    }

    const selectedEvent = events.find((event) => event.id === parseInt(eventId, 10));
    setEvent(selectedEvent);

    // Show notification
    addToast(`Switched to ${selectedEvent.title} event`, TOAST_TYPES.INFO);
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null); // Clear previous results when a new file is selected
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      addToast('Please select a CSV file', TOAST_TYPES.WARNING);
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const eventId = parseInt(event.id);
      const url = API_URL_CONFIG.uploadCSV + `${eventId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      const result = await response.json();
      console.log('Upload result:', result);
      setUploadResult(result);
      
      if (response.ok) {
        setUploadResult(result);
        addToast(`Successfully imported ${result.added_users} students (${result.failed_users} skipped)`, TOAST_TYPES.SUCCESS);
      } else {
        addToast('Failed to upload CSV', TOAST_TYPES.ERROR);
      }
    } catch (error) {
      addToast('Error uploading CSV file', TOAST_TYPES.ERROR);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Bulk Import Participants</h1>
          <p className="mt-1 text-indigo-100">
            Upload CSV files to add multiple participants at once
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Upload CSV File</h2>
            <Link 
              href="/importLogs" 
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
            >
              <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
              View Import Logs
            </Link>
          </div>

          <form onSubmit={handleUpload} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event Collection
              </label>
              <select
                value={event?.id || ""}
                onChange={handleEventChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Select CSV file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Required CSV headers: firstName, lastName, email, phone
                  </p>
                  <p className="text-xs text-gray-500">
                    (Ticket IDs will be automatically generated)
                  </p>
                </div>
              </div>
              {file && (
                <div className="mt-2 text-sm text-gray-500">
                  Selected file: <span className="font-medium text-indigo-600">{file.name}</span>
                </div>
              )}
            </div>

            {/* Upload Result Summary */}
            {uploadResult && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Upload Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-sm font-medium text-green-800">Successfully Imported</p>
                    <p className="text-2xl font-bold text-green-600">{uploadResult.added_users}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                    <p className="text-sm font-medium text-amber-800">Skipped Entries</p>
                    <p className="text-2xl font-bold text-amber-600">{uploadResult.failed_users}</p>
                  </div>
                </div>
                {uploadResult.failed_users > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Some entries were skipped due to missing or invalid data.</p>
                    <Link 
                      href="/importLogs" 
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View details in import logs
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Link
                href="/dashboard"
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={uploading || !file || !event}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload CSV'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
