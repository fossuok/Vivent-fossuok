"use client";
import { useState, useEffect } from "react";
import ParticipantList from "@/components/ParticipantList";
import Link from "next/link";
import {
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "@/redux/slices/eventSlice";
import { API_URL_CONFIG } from "@/api/configs";

const PAGE_SIZE = 15; // Participants per page

export default function ParticipantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.event);

  // State variables
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [paginatedParticipants, setPaginatedParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all events on component mount
  useEffect(() => {
    try{
      dispatch(fetchEvents());
    }catch (error) {
      console.error("Error fetching events:", error);
      addToast("Failed to fetch events", TOAST_TYPES.ERROR);
    }
  }, [dispatch]);

  // Fetch participants for the selected event
  const fetchParticipants = async (event) => {
    if (!event) return; // Do nothing if no event is selected
    
    setIsLoading(true);
    setError(null);

    try {
      const eventId = parseInt(event.id);
      const url = API_URL_CONFIG.getParticipants + `${eventId}/participants`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setParticipants([]);
        setError(null);
        addToast("No participants found for this event", TOAST_TYPES.WARNING);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError("Failed to fetch participants");
        addToast("Failed to fetch participants", TOAST_TYPES.ERROR);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setParticipants(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch participants");
      addToast("Failed to fetch participants", TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch participants when the current event changes
  useEffect(() => {
    fetchParticipants(currentEvent);
  }, [currentEvent]);

  // Handle event selection
  const handleEventChange = (e) => {
    const eventId = e.target.value;
    
    // Clear previous state
    setParticipants([]);
    setError(null);
    setPage(1);
    
    if (!eventId) {
      setCurrentEvent(null);
      return;
    }

    const selectedEvent = events.find((event) => event.id === parseInt(eventId, 10));
    setCurrentEvent(selectedEvent);
    
    // Update URL with the selected event
    const params = new URLSearchParams(searchParams.toString());
    params.set("event", selectedEvent.id);
    router.replace(`${pathname}?${params.toString()}`);

    // Show notification
    addToast(`Switched to ${selectedEvent.title} event`, TOAST_TYPES.INFO);
  };

  // Filter and paginate participants
  useEffect(() => {
    const filteredParticipants =
      participants?.filter((participant) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const firstName = participant?.firstName?.toLowerCase() || "";
        const lastName = participant?.lastName?.toLowerCase() || "";
        const email = participant?.email?.toLowerCase() || "";
        return (
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term)
        );
      }) || [];

    setTotalParticipants(filteredParticipants.length);
    const updatedPaginated = filteredParticipants.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

    setPaginatedParticipants(updatedPaginated);
  }, [participants, page, searchTerm]);

  // Calculate total pages
  const totalPages = Math.ceil(totalParticipants / PAGE_SIZE);

  // Handle page change
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Reset to first page when search term changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Function to update participants attendance status
  const updateParticipants = (updatedParticipants) => {
    setParticipants(updatedParticipants); // Update the full participants list
    const updatedPaginated = updatedParticipants.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
    setPaginatedParticipants(updatedPaginated); // Update the paginated list
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Participant Management</h1>
          <p className="mt-1 text-indigo-100">
            Manage participants and attendance for Events
          </p>
        </div>

        {/* Event Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block text-sm font-semibold text-indigo-700 mb-2">
            Select Event
          </label>
          <select
            value={currentEvent?.id || ""}
            onChange={handleEventChange}
            className="w-full md:w-1/3 px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/addParticipant?event=${currentEvent?.id || ""}`}
                className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                  !currentEvent ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Participant
              </Link>
              <Link
                href={`/bulkUpload?event=${currentEvent?.id || ""}`}
                className={`inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                  !currentEvent ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                Bulk Import
              </Link>
            </div>

            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={handleSearch}
                disabled={!currentEvent}
              />
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Failed to load participants. Please try again.
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : totalParticipants === 0 ? (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No participants found in this event
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new participant.
              </p>
            </div>
          ) : (
            <>
              <ParticipantList
                participants={paginatedParticipants}
                event={currentEvent}
                updateParticipants={updateParticipants}
              />
              {/* Pagination Controls */}
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <span className="text-sm text-gray-600">
                  Showing {(page - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(page * PAGE_SIZE, totalParticipants)} of {totalParticipants}{" "}
                  Participants
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => goToPage(idx + 1)}
                      className={`px-3 py-1 rounded ${
                        page === idx + 1
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
