'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useToast, TOAST_TYPES } from '@/components/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function EmailTemplatePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !templateName || !templateSubject) {
      addToast('Please fill all required fields', TOAST_TYPES.WARNING);
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('htmlFile', file);
    formData.append('name', templateName);
    formData.append('subject', templateSubject);
    
    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        addToast('Email template uploaded successfully', TOAST_TYPES.SUCCESS);
        router.push('/email-templates');
      } else {
        addToast(result.error || 'Failed to upload template', TOAST_TYPES.ERROR);
      }
    } catch (error) {
      addToast('Error uploading template', TOAST_TYPES.ERROR);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upload Email Template</h2>
        </div>

        <form onSubmit={handleUpload} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter template name"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={templateSubject}
              onChange={(e) => setTemplateSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter email subject"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload HTML Template
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Select HTML file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".html"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  HTML file with your email template
                </p>
                <p className="text-xs text-gray-500">
                  Use firstName, lastName, etc. for personalization
                </p>
              </div>
            </div>
            {file && (
              <div className="mt-2 text-sm text-gray-500">
                Selected file: <span className="font-medium text-indigo-600">{file.name}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/EmailCampaign"
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !file}
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
                'Upload Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
