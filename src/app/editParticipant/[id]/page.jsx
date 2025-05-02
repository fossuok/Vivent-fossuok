"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/outline";
import ConfirmDialog from "@/components/ConfirmDialog";
import DashboardLayout from "@/components/DashboardLayout";
import { API_URL_CONFIG } from "@/api/configs";

export default function EditParticipantPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventID = searchParams.get('event');
  const [participant, setParticipant] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    linkedin: "",
    studentId: "",
    nic: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);


  // Fetch selected participant for the selected event
  const fetchParticipants = async (event) => {
    const eventId = parseInt(event, 10);
    const url = API_URL_CONFIG.getSingleParticipant + `${eventId}/participants/${id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      setError("Failed to fetch participant");
      addToast("Failed to fetch participants", TOAST_TYPES.ERROR);
      return;
    }

    const data = await response.json();
    setParticipant(data);
  };

  useEffect(() => {
    fetchParticipants(eventID);
  }, [eventID]);


  useEffect(() => {
    if (participant) {
      setFormData({
        firstName: participant.firstName || "",
        lastName: participant.lastName || "",
        phone: participant.phone || "",
        linkedin: participant.linkedin || "",
        studentId: participant.studentId || "",
        nic: participant.nic || "",
      });
    }
  }, [participant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      const url = API_URL_CONFIG.getSingleParticipant + `${parseInt(eventID)}/participants/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          linkedin: formData.linkedin,
          studentId: formData.studentId,
          attended: participant.attended,
          nic: formData.nic,
        }),
      });

      if (response.ok) {
        router.push(`/participants?event=${eventID}`);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setIsSubmitting(false);
    }
  };

  if (error) 
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Failed to load participant</h2>
            <p className="text-gray-600 mb-4">Unable to retrieve participant information.</p>
          </div>
        </div>
      </DashboardLayout>
    );
    
  if (!participant) 
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Edit Participant</h1>
          <p className="mt-1 text-indigo-100">
            {/* Update participant information for {workshop.charAt(0).toUpperCase() + workshop.slice(1)} event */}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="text"
                      placeholder="Enter phone number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      id="linkedin"
                      type="text"
                      placeholder="linkedin.com/in/username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.linkedin}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>


              {/* Identification Section */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    placeholder="Enter student ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    required
                  />
                </div>
                  <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                      NIC
                    </label>
                    <input
                      id="nic"
                      type="text"
                      placeholder="linkedin.com/in/username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.nic}
                      onChange={(e) =>
                        setFormData({ ...formData, nic: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => router.push(`/participants?event=${eventID}`)}
                className="mr-4 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg shadow-sm hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Update Student"
        message="Are you sure you want to save these changes?"
        confirmText="Save Changes"
        cancelText="Cancel"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
        onConfirm={confirmUpdate}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}
