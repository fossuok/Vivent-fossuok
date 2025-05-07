// components/RoleBasedRoute.jsx
'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // First check if authenticated
    if (!isAuthenticated) {
      router.push('/Login');
      return;
    }
    
    // Then check if user has allowed role
    if (!allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  // Don't render anything if not authenticated or not authorized
  if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
    return null;
  }

  return children;
}
