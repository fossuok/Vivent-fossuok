// src/app/importLogs/page.js
"use client";
import { useState, useEffect } from "react";
import { ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import { API_URL_CONFIG } from "@/api/configs";
import { useSelector } from "react-redux";

export default function ImportLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const { events } = useSelector((state) => state.event);

  const { addToast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = API_URL_CONFIG.getImportLogs;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        addToast("No import logs found", TOAST_TYPES.INFO);
        setLogs([]);
        return;
      }

      const data = await response.json();
      console.log("Import logs:", data);

      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const clearLogs = async () => {
    try {
      setLoading(true);
      const url = API_URL_CONFIG.clearImportLogs;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        addToast("Logs cleared successfully", TOAST_TYPES.SUCCESS);
        setLogs([]);
        setSelectedLog(null);
      } else {
        addToast("Failed to clear logs", TOAST_TYPES.ERROR);
      }
    } catch (error) {
      console.error("Error clearing logs:", error);
      addToast("Error clearing logs", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Import Logs</h2>
            {logs.length > 0 && (
              <button
                onClick={clearLogs}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                disabled={loading}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Clear Logs
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No import logs found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Import logs will appear here after you perform bulk imports.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Imports
                  </h3>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLog?.id === log.id
                            ? "bg-indigo-50 border-indigo-300"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.filename}
                            </p>
                            <p className="text-sm text-gray-500">
                              Event:{" "}
                              {events.find((event) => event.id === log.event_id)
                                ?.title || "Unknown Event"}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 flex space-x-4">
                          <span className="text-sm text-green-600">
                            Imported: {log.added_users}
                          </span>
                          <span className="text-sm text-red-600">
                            Skipped: {log.failed_users}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedLog && (
                  <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Import Details
                    </h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        File:{" "}
                        <span className="font-medium text-gray-900">
                          {selectedLog.filename}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Workshop:{" "}
                        <span className="font-medium text-gray-900">
                          {events.find(
                            (event) => event.id === selectedLog.event_id
                          )?.title || "Unknown Event"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Date:{" "}
                        <span className="font-medium text-gray-900">
                          {new Date(selectedLog.created_at).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Rows:{" "}
                        <span className="font-medium text-gray-900">
                          {selectedLog.added_users + selectedLog.failed_users}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            selectedLog.status == "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedLog.status}
                        </span>
                      </p>
                    </div>

                    {selectedLog.failed_users > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Skipped Entries
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Information
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Email
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Reason
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedLog.failed_users_emails.map(
                                (row, index) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                      {row.firstName} {row.lastName}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                      {row.email}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-red-600">
                                      {row.msg}
                                    </td>
                                  </tr>
                                )
                              )}
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
