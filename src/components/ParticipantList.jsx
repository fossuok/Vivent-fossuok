import Link from "next/link";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import { API_URL_CONFIG } from "@/api/configs";

export default function ParticipantList({
  participants,
  event = "students",
  updateParticipants, // Function passed from parent to update participants
}) {
  const [loadingAttendance, setLoadingAttendance] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const toggleAttendance = async (id, present) => {
    setLoadingAttendance(id);
    try {
      const eventID = parseInt(event.id);
      const participantID = parseInt(id);

      // Send the request to the server
      const url =
        API_URL_CONFIG.markPresent + `${eventID}/participants/${participantID}/attend`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        addToast("Failed to update attendance", TOAST_TYPES.ERROR);
        return;
      }

      // Optimistically update the participants state
      const updatedParticipants = participants.map((participant) =>
        participant.id === id ? { ...participant, attended: present } : participant
      );
      updateParticipants(updatedParticipants); // Notify the parent about the update

      addToast(`Student marked as ${present ? "present" : "absent"}`, TOAST_TYPES.SUCCESS);
    } catch (error) {
      addToast("Failed to update attendance", TOAST_TYPES.ERROR);
    } finally {
      setLoadingAttendance(null);
    }
  };

  const promptDeleteParticipant = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setLoadingDelete(deleteId);
    try {
      const url = API_URL_CONFIG.deleteParticipant + `${event.id}/participants/${deleteId}`;
      await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      // Notify parent to remove the deleted participant
      const updatedParticipants = participants.filter(
        (participant) => participant.id !== deleteId
      );
      updateParticipants(updatedParticipants);

      addToast("Participant deleted successfully", TOAST_TYPES.SUCCESS);
    } catch (error) {
      addToast("Failed to delete participant", TOAST_TYPES.ERROR);
    } finally {
      setLoadingDelete(null);
      setConfirmOpen(false);
    }
  };

  if (!participants)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Attendance
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                IDs
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.map((participant) => (
              <tr
                key={participant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        toggleAttendance(participant.id, !participant.attended)
                      }
                      className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        participant.attended ? "bg-green-500" : "bg-gray-300"
                      }`}
                      disabled={loadingAttendance === participant.id}
                    >
                      <span
                        className={`absolute left-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                          participant.attended ? "translate-x-6" : ""
                        }`}
                      />
                      {loadingAttendance === participant.id && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="animate-ping absolute h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                        </span>
                      )}
                    </button>
                    <span
                      className={`ml-3 text-sm ${
                        participant.attended
                          ? "text-green-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {participant.attended ? "Present" : "Absent"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {participant.firstName} {participant.lastName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{participant.email}</div>
                  <div className="text-sm text-gray-500">{participant.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Participant: {participant.studentId}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Ticket: {participant.ticketId}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/editParticipant/${participant.id}?event=${event.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <PencilIcon className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => promptDeleteParticipant(participant.id)}
                      disabled={loadingDelete === participant.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      {loadingDelete === participant.id ? (
                        <span className="animate-spin h-3.5 w-3.5 mr-1 border-t-2 border-red-700 rounded-full"></span>
                      ) : (
                        <TrashIcon className="h-3.5 w-3.5 mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Participant"
        message="Are you sure you want to delete this participant? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {participants.length === 0 && (
        <div className="text-center py-12 px-4">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No participants
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new participant.
          </p>
        </div>
      )}
    </div>
  );
}