'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice'; // Import your logout action
import {
  UserPlusIcon,
  DocumentArrowUpIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon,
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useToast, TOAST_TYPES } from '@/components/ToastContext';
import { NAVIGATIONS } from '@/data/data';
import { resetTemplates } from '@/redux/slices/templateSlice';
import { resetEvents } from '@/redux/slices/eventSlice';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state
    dispatch(logout());
    dispatch(resetTemplates())
    dispatch(resetEvents())
    
    // Show success message
    addToast('You have been successfully logged out', TOAST_TYPES.SUCCESS);
    
    // Redirect to login page
    router.push('/Login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-indigo-800 text-white ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-indigo-700 flex items-center justify-between">
          {!collapsed && <span className="font-bold text-xl">Summit App</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1 rounded-md hover:bg-indigo-700"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {NAVIGATIONS.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 ${
                    isActive(item.href)
                      ? 'bg-indigo-900 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700'
                  } transition-colors duration-200`}
                >
                  <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-indigo-700 flex items-center">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
          {!collapsed ? (
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="mt-2 p-2 rounded-full hover:bg-indigo-700 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 text-indigo-300 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
