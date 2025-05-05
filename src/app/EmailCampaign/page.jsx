// src/app/EmailCampaign/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PaperAirplaneIcon,
  ClipboardIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useSelector, useDispatch } from "react-redux";
import { API_URL_CONFIG } from "@/api/configs";
import { fetchTemplates, resetTemplates } from "@/redux/slices/templateSlice";
import RoleBasedRoute from "@/components/RoleBasedRoute";

export default function EmailCampaignPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const dispatch = useDispatch();

  // Redux state for events and templates
  const { events } = useSelector((state) => state.event);
  const { templates } = useSelector((state) => state.template);
  const { token } = useSelector((state) => state.auth);

  // State variables
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Participant selection state
  const [participants, setParticipants] = useState([]);
  const [availablePlaceholders, setAvailablePlaceholders] = useState([]);
  const [templatePlaceholders, setTemplatePlaceholders] = useState([]);
  const [selectedPlaceholders, setSelectedPlaceholders] = useState([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Copy to clipboard
  const [copiedText, copy] = useCopyToClipboard();

  // Fetch templates when event changes
  useEffect(() => {
    if (selectedEvent) {
      dispatch(resetTemplates());
      dispatch(fetchTemplates(selectedEvent));
    }
  }, [dispatch, selectedEvent]);

  // Extract placeholders from template body when template changes
  useEffect(() => {
    if (!selectedTemplate) return;

    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [...selectedTemplate.body.matchAll(regex)];
    const placeholders = matches.map((match) => match[1]);

    // Remove duplicates
    setTemplatePlaceholders([...new Set(placeholders)]);
  }, [selectedTemplate]);

  // Set available placeholders based on participant fields
  useEffect(() => {
    if (participants.length > 0) {
      // Get all possible fields from the first participant
      const sampleParticipant = participants[0];
      const fields = Object.keys(sampleParticipant);
      setAvailablePlaceholders(fields);
    }
  }, [participants]);

  // Update selected template when ID changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(
        (t) => t.id === parseInt(selectedTemplateId)
      );
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
      setTemplatePlaceholders([]);
    }
  }, [selectedTemplateId, templates]);

  // Fetch participants function
  const fetchParticipants = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const eventId = parseInt(selectedEvent);
      const url = API_URL_CONFIG.getParticipants + `${eventId}/participants`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setParticipants([]);
        addToast("No participants found for this event", TOAST_TYPES.WARNING);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        addToast("Failed to fetch participants", TOAST_TYPES.ERROR);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      addToast("Error loading participants", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Fetch participants when event changes
  useEffect(() => {
    if (!selectedEvent) {
      setParticipants([]);
      setSelectedParticipantIds([]);
      setSelectedTemplateId("");
      return;
    }
    fetchParticipants();
  }, [selectedEvent]);

  // Handle event selection
  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    setSelectedTemplateId("");
    setSelectedTemplate(null);
    setSelectedPlaceholders([]);
  };

  // Handle "Select All"
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedParticipantIds([]);
      setSelectAll(false);
    } else {
      setSelectedParticipantIds(participants.map((p) => p.id));
      setSelectAll(true);
    }
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (participantId) => {
    if (selectedParticipantIds.includes(participantId)) {
      setSelectedParticipantIds((prev) =>
        prev.filter((id) => id !== participantId)
      );
      setSelectAll(false);
    } else {
      setSelectedParticipantIds((prev) => [...prev, participantId]);
      if (selectedParticipantIds.length + 1 === participants.length) {
        setSelectAll(true);
      }
    }
  };

  // Keep selectAll in sync with selectedParticipantIds
  useEffect(() => {
    setSelectAll(
      participants.length > 0 &&
        selectedParticipantIds.length === participants.length
    );
  }, [selectedParticipantIds, participants]);

  // Handle preview
  const handlePreview = async () => {
    if (!selectedTemplate) {
      addToast("Please select a template", TOAST_TYPES.WARNING);
      return;
    }
    setLoading(true);
    try {
      // For now, just show the template body with placeholders
      setPreviewHtml(selectedTemplate.body.replace(/\n/g, "<br>"));
      setPreviewMode(true);
    } catch (error) {
      addToast("Error loading preview", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Add placeholder to selected list
  const handleAddPlaceholder = (placeholder) => {
    if (!selectedPlaceholders.includes(placeholder)) {
      setSelectedPlaceholders((prev) => [...prev, placeholder]);
    }
  };

  // Remove placeholder from selected list
  const handleRemovePlaceholder = (placeholder) => {
    setSelectedPlaceholders((prev) => prev.filter((p) => p !== placeholder));
  };

  // Batch send emails (10 at a time)
  const handleSendEmails = async () => {
    if (!selectedTemplate || !selectedEvent || !senderName || !senderEmail) {
      addToast("Please fill all required fields", TOAST_TYPES.WARNING);
      return;
    }
    if (selectedParticipantIds.length === 0) {
      addToast("Please select at least one participant", TOAST_TYPES.WARNING);
      return;
    }
    setIsSending(true);

    // Batch sending logic
    const batchSize = 10;
    let sentCount = 0;
    let success = true;

    for (let i = 0; i < selectedParticipantIds.length; i += batchSize) {
      const batch = selectedParticipantIds.slice(i, i + batchSize);
      try {
        const payload = {
          event_id: parseInt(selectedEvent),
          placeholder_var: selectedPlaceholders,
          recipient_ids: batch,
          sender_email: senderEmail,
          sender_name: senderName,
          template_id: parseInt(selectedTemplateId),
        };

        const response = await fetch(API_URL_CONFIG.sendEmails, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          addToast("Failed to send a batch of emails", TOAST_TYPES.ERROR);
          success = false;
          break;
        }
        sentCount += batch.length;
        addToast(
          `Sent ${sentCount} of ${selectedParticipantIds.length} emails`,
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
    <RoleBasedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
            <h1 className="text-2xl font-bold text-white">Email Campaign</h1>
            <p className="mt-1 text-indigo-100">
              Select recipients and send personalized emails to participants in
              your events.
            </p>
          </div>

          {/* Template Placeholders */}
          {templatePlaceholders.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Template Placeholders
              </h3>
              <div className="flex flex-wrap gap-2">
                {templatePlaceholders.map((field) => (
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
                      <span className="text-green-600 text-xs ml-1">
                        Copied!
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        Select Event (Recipients)
                      </label>
                      <select
                        value={selectedEvent || ""}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Email Template
                      </label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={!selectedEvent}
                      >
                        <option value="">Select a template</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.templateName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Available Placeholders */}
                  {selectedTemplate && availablePlaceholders.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Placeholders (Click to add)
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                        {availablePlaceholders.map((field) => (
                          <button
                            key={field}
                            onClick={() => handleAddPlaceholder(field)}
                            className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-300 text-sm hover:bg-indigo-50 hover:border-indigo-300"
                          >
                            <PlusIcon className="h-3 w-3" />
                            {field}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Placeholders */}
                  {selectedPlaceholders.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Placeholders
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-indigo-50">
                        {selectedPlaceholders.map((field) => (
                          <div
                            key={field}
                            className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-indigo-200"
                          >
                            {field}
                            <button
                              onClick={() => handleRemovePlaceholder(field)}
                              className="text-red-500 hover:text-red-700 ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

                  {/* Participant Table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Recipients
                    </label>
                    {loading ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : participants.length === 0 ? (
                      <div className="text-gray-500 py-6 text-center border rounded-lg">
                        {selectedEvent
                          ? "No participants found for this event."
                          : "Please select an event to view participants."}
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
                            {participants.map((participant) => (
                              <tr key={participant.id}>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedParticipantIds.includes(
                                      participant.id
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(participant.id)
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  {participant.firstName} {participant.lastName}
                                </td>
                                <td className="px-4 py-2">
                                  {participant.email}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-600">
                      Selected:{" "}
                      <span className="font-semibold text-indigo-600">
                        {selectedParticipantIds.length}
                      </span>{" "}
                      / {participants.length}
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
                        !selectedEvent ||
                        !senderName ||
                        !senderEmail ||
                        selectedParticipantIds.length === 0
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
    </RoleBasedRoute>
  );
}
