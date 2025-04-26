import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function StudentList({students}) {
  // const { data: students, error, mutate } = useSWR("/api/Students", fetcher);
  const { mutate } = useSWR("/api/Students", fetcher);
  const [loadingAttendance, setLoadingAttendance] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const toggleAttendance = async (id, present) => {
    setLoadingAttendance(id);
    try {
      await fetch(`/api/Students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ present }),
      });
      mutate();
    } finally {
      setLoadingAttendance(null);
    }
  };

  const promptDeleteStudent = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setLoadingDelete(deleteId);
    try {
      await fetch("/api/Students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      mutate();
    } finally {
      setLoadingDelete(null);
      setConfirmOpen(false);
    }
  };

  // const deleteStudent = async (id) => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete this student?"
  //   );
  //   if (!confirmed) return;
    
  //   setLoadingDelete(id);
  //   try {
  //     await fetch("/api/Students", {
  //       method: "DELETE",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ id }),
  //     });
  //     mutate();
  //   } finally {
  //     setLoadingDelete(null);
  //   }
  // };

  // if (error) 
  //   return (
  //     <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm text-center">
  //       Failed to load students. Please try again.
  //     </div>
  //   );
    
  if (!students) 
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IDs
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button 
                      onClick={() => toggleAttendance(student._id, !student.attended)}
                      className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        student.attended ? "bg-green-500" : "bg-gray-300"
                      }`}
                      disabled={loadingAttendance === student._id}
                    >
                      <span 
                        className={`absolute left-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                          student.attended ? "translate-x-6" : ""
                        }`}
                      />
                      {loadingAttendance === student._id && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="animate-ping absolute h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                        </span>
                      )}
                    </button>
                    <span className={`ml-3 text-sm ${student.attended ? "text-green-600 font-medium" : "text-gray-500"}`}>
                      {student.attended ? "Present" : "Absent"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{student.email}</div>
                  <div className="text-sm text-gray-500">{student.phone}</div>
                  <a 
                    href={student.linkedin.startsWith('http') ? student.linkedin : `https://${student.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    LinkedIn
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Student: {student.studentId}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Ticket: {student.ticketId}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/editStudent/${student._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <PencilIcon className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => promptDeleteStudent(student._id)}
                      disabled={loadingDelete === student._id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      {loadingDelete === student._id ? (
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
      
      {/* Add the ConfirmDialog component */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {students.length === 0 && (
        <div className="text-center py-12 px-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
        </div>
      )}
    </div>
  );
}
