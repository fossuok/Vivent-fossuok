"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PaperAirplaneIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { EVENTS, EXCLUDE_FIELDS } from "@/data/data";

export default function EmailCampaignPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [workshops, setWorkshops] = useState(EVENTS);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Student selection state
  const [students, setStudents] = useState([]);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Copy to clipboard
  const [copiedText, copy] = useCopyToClipboard();

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/email-templates");
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        addToast("Failed to load email templates", TOAST_TYPES.ERROR);
      }
    }
    fetchTemplates();
  }, [addToast]);

  // Fetch students when workshop changes
  useEffect(() => {
    if (!selectedWorkshop) {
      setStudents([]);
      setTemplateVariables([]);
      return;
    }
    setLoading(true);
    fetch(`/api/workshops/${selectedWorkshop}/students`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data || []);
        // Dynamically extract variable fields from the first student
        if (data && data.length > 0) {
          const fields = Object.keys(data[0]).filter(
            (key) => !EXCLUDE_FIELDS.includes(key)
          );
          setTemplateVariables(fields);
        } else {
          setTemplateVariables([]);
        }
        setSelectedStudentIds([]);
        setSelectAll(false);
      })
      .catch(() => addToast("Failed to load students", TOAST_TYPES.ERROR))
      .finally(() => setLoading(false));
  }, [selectedWorkshop, addToast]);

  // Handle "Select All"
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudentIds([]);
      setSelectAll(false);
    } else {
      setSelectedStudentIds(students.map((s) => s._id));
      setSelectAll(true);
    }
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
      setSelectAll(false);
    } else {
      setSelectedStudentIds((prev) => [...prev, studentId]);
      if (selectedStudentIds.length + 1 === students.length) {
        setSelectAll(true);
      }
    }
  };

  // Keep selectAll in sync with selectedStudentIds
  useEffect(() => {
    setSelectAll(
      students.length > 0 && selectedStudentIds.length === students.length
    );
  }, [selectedStudentIds, students]);

  // Handle preview
  const handlePreview = async () => {
    if (!selectedTemplate) {
      addToast("Please select a template", TOAST_TYPES.WARNING);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/email-templates/${selectedTemplate}/preview`
      );
      const data = await response.json();
      if (response.ok) {
        setPreviewHtml(data.html);
        setPreviewMode(true);
      } else {
        addToast("Failed to load template preview", TOAST_TYPES.ERROR);
      }
    } catch (error) {
      addToast("Error loading preview", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Batch send emails (10 at a time)
  const handleSendEmails = async () => {
    if (!selectedTemplate || !selectedWorkshop || !senderName || !senderEmail) {
      addToast("Please fill all required fields", TOAST_TYPES.WARNING);
      return;
    }
    if (selectedStudentIds.length === 0) {
      addToast("Please select at least one student", TOAST_TYPES.WARNING);
      return;
    }
    setIsSending(true);

    // Batch sending logic
    const batchSize = 10;
    let sentCount = 0;
    let success = true;

    for (let i = 0; i < selectedStudentIds.length; i += batchSize) {
      const batch = selectedStudentIds.slice(i, i + batchSize);
      try {
        const response = await fetch("/api/send-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: selectedTemplate,
            workshop: selectedWorkshop,
            senderName,
            senderEmail,
            studentIds: batch,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          addToast(
            "Failed to send a batch of emails",
            TOAST_TYPES.ERROR
          );
          success = false;
          break;
        }
        sentCount += batch.length;
        addToast(
          `Sent ${sentCount} of ${selectedStudentIds.length} emails`,
          TOAST_TYPES.INFO
        );
      } catch (error) {
        addToast("Error sending a batch of emails", TOAST_TYPES.ERROR);
        success = false;
        break;
      }
    }

    setIsSending(false);
    if (success) {
      addToast("All emails sent successfully!", TOAST_TYPES.SUCCESS);
      router.push("/EmailLogs");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Email Campaign</h1>
          <p className="mt-1 text-indigo-100">
            Select recipients and send personalized emails to students in your
            workshops
          </p>
        </div>

        {/* Template Variables */}
        <div className="flex flex-wrap gap-4">
          {templateVariables.map((field) => (
            <div
              key={field}
              className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded text-indigo-800 border border-indigo-200"
            >
              <span className="font-mono">{`{{${field}}}`}</span>
              <button
                onClick={() => copy(`{{${field}}}`)}
                className="hover:text-indigo-600 focus:outline-none"
                title="Copy"
              >
                <ClipboardIcon className="h-4 w-4" />
              </button>
              {copiedText === `{{${field}}}` && (
                <span className="text-green-600 text-xs ml-1">Copied!</span>
              )}
            </div>
          ))}
        </div>

        {/* Campaign Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 space-y-6">
            {previewMode ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Template Preview
                  </h3>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Back to Campaign Setup
                  </button>
                </div>
                <div className="border rounded-md p-4 bg-gray-50">
                  <div
                    className="email-preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Email Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Workshop (Recipients)
                    </label>
                    <select
                      value={selectedWorkshop}
                      onChange={(e) => setSelectedWorkshop(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a workshop</option>
                      {workshops.map((workshop) => (
                        <option key={workshop} value={workshop}>
                          {workshop.charAt(0).toUpperCase() + workshop.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your Name or Organization"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Email
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                {/* Students Table */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Recipients
                  </label>
                  {loading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-gray-500 py-6">
                      No students found for this workshop.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student._id}>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.includes(
                                    student._id
                                  )}
                                  onChange={() =>
                                    handleCheckboxChange(student._id)
                                  }
                                />
                              </td>
                              <td className="px-4 py-2">
                                {student.firstName} {student.lastName}
                              </td>
                              <td className="px-4 py-2">{student.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-600">
                    Selected:{" "}
                    <span className="font-semibold text-indigo-600">
                      {selectedStudentIds.length}
                    </span>{" "}
                    / {students.length}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={loading || !selectedTemplate}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Preview Template"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmails}
                    disabled={
                      isSending ||
                      !selectedTemplate ||
                      !selectedWorkshop ||
                      !senderName ||
                      !senderEmail ||
                      selectedStudentIds.length === 0
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Send Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
