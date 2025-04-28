"use client";
import { useState } from "react";
import useSWR from "swr";
import StudentList from "@/components/StudentList";
import Link from "next/link";
import {
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import DashboardLayout from "@/components/DashboardLayout";
import { EVENTS } from "@/data/data";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const PAGE_SIZE = 15; // Students per page

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToast } = useToast();

  // Workshop selection
  const urlWorkshop = searchParams.get('workshop');
  const [currentWorkshop, setCurrentWorkshop] = useState(urlWorkshop || "students");
  const [workshops] = useState(EVENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const handleWorkshopChange = (e) => {
    const workshop = e.target.value;
    setCurrentWorkshop(workshop);
    setPage(1); // Reset to first page on workshop change

    // Update URL with the selected workshop
    const params = new URLSearchParams(searchParams.toString());
    params.set("workshop", workshop);
    router.replace(`${pathname}?${params.toString()}`);

    // Show notification
    addToast(`Switched to ${workshop} workshop`, TOAST_TYPES.INFO);
  };

  // Fetch all students for the selected workshop
  const { data: students, error } = useSWR(
    currentWorkshop ? `/api/workshops/${currentWorkshop}/students` : null,
    fetcher
  );

  // Filter students by search term
  const filteredStudents = students?.filter((student) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const firstName = student?.firstName?.toLowerCase() || "";
    const lastName = student?.lastName?.toLowerCase() || "";
    const email = student?.email?.toLowerCase() || "";
    return (
      firstName.includes(term) ||
      lastName.includes(term) ||
      email.includes(term)
    );
  }) || [];

  // Pagination calculations
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE);
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-white">Student Management</h1>
          <p className="mt-1 text-indigo-100">
            Manage students and attendance for workshops
          </p>
        </div>

        {/* Workshop Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block text-sm font-semibold text-indigo-700 mb-2">
            Select Workshop
          </label>
          <select
            value={currentWorkshop}
            onChange={handleWorkshopChange}
            className="w-full md:w-1/3 px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            {workshops.map((workshop) => (
              <option key={workshop} value={workshop}>
                {workshop.charAt(0).toUpperCase() + workshop.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/addStudent?workshop=${currentWorkshop}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Student
              </Link>
              <Link
                href={`/bulkUpload?workshop=${currentWorkshop}`}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
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
              />
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Failed to load students. Please try again.
              </div>
            </div>
          ) : !students ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : totalStudents === 0 ? (
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
                No students found in this workshop
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new student.
              </p>
            </div>
          ) : (
            <>
              <StudentList
                students={paginatedStudents}
                workshop={currentWorkshop}
              />
              {/* Pagination Controls */}
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <span className="text-sm text-gray-600">
                  Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalStudents)} of {totalStudents} students
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
