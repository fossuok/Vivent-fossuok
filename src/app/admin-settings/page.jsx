"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  TrashIcon,
  PlusCircleIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast, TOAST_TYPES } from "@/components/ToastContext";
import { fetchEvents, deleteEvent } from "@/redux/slices/eventSlice";
import { API_URL_CONFIG } from "@/api/configs";
import ConfirmDialog from "@/components/ConfirmDialog";
import RoleBasedRoute from "@/components/RoleBasedRoute";

export default function AdminSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user, token } = useSelector((state) => state.auth);
  const { events } = useSelector((state) => state.event);
  const [activeTab, setActiveTab] = useState("events");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Confirmation dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // "event" or "user"
  
  const [newUser, setNewUser] = useState({
    active: true,
    username: "",
    email: "",
    password: "",
    role: "oc",
  });

  // Fetch events
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(API_URL_CONFIG.getUsers, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        addToast("Failed to load users", TOAST_TYPES.ERROR);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, token, addToast]);

  const handleDeleteConfirm = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === "event") {
      dispatch(deleteEvent(itemToDelete, token));
      addToast("Event deleted successfully", TOAST_TYPES.SUCCESS);
    } else if (deleteType === "user") {
      deleteUser(itemToDelete);
    }
    setConfirmOpen(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const deleteUser = async (selectedUser) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL_CONFIG.deleteUser, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedUser.id, username: selectedUser.username }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const data = await response.json();

      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      addToast(
        `User: ${data.username} deleted successfully`,
        TOAST_TYPES.SUCCESS
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      addToast("Failed to delete user", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.username || !newUser.email || !newUser.password) {
      addToast("Please fill all required fields", TOAST_TYPES.WARNING);
      return;
    }

    if (newUser.password.length < 8) {
      addToast("Password must be at least 8 characters long", TOAST_TYPES.WARNING);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL_CONFIG.createUser, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.status === 400) {
        addToast("User already exists", TOAST_TYPES.ERROR);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const data = await response.json();
      setUsers((prev) => [...prev, data]);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "oc",
      });
      addToast("User created successfully", TOAST_TYPES.SUCCESS);
    } catch (error) {
      console.error("Error creating user:", error);
      addToast("Failed to create user", TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleBasedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl px-6 py-6 shadow-md">
            <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
            <p className="mt-1 text-indigo-100">
              Manage events, users, and system settings
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("events")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "events"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <CalendarIcon className="h-5 w-5 inline mr-2" />
                  Events
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "users"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <UserGroupIcon className="h-5 w-5 inline mr-2" />
                  Users
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "events" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Manage Events
                  </h2>

                  {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No events found. Create an event to get started.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {event.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {event.organization}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(event.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {event.location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {event.is_active ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteConfirm(event.id, "event")}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Manage Users
                  </h2>

                  {/* Add User Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Add New User
                    </h3>
                    <form
                      onSubmit={handleAddUser}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={newUser.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newUser.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={newUser.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          name="role"
                          value={newUser.role}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="oc">OC</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {loading ? (
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
                              Adding...
                            </>
                          ) : (
                            <>
                              <PlusCircleIcon className="h-4 w-4 mr-2" />
                              Add User
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Users List */}
                  {loading && users.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found. Add a user to get started.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((role) => (
                            <tr key={role.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {role.username}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {role.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {role.role === "admin" ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    OC
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteConfirm(role, "user")}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={role.id === user.id} // Prevent deleting yourself
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Confirm Deletion"
          message={deleteType === "event" 
            ? "Are you sure you want to delete this event? This action cannot be undone." 
            : "Are you sure you want to delete this user? This action cannot be undone."}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </DashboardLayout>
    </RoleBasedRoute>
  );
}
