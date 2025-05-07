// hooks/usePermission.js
import { useSelector } from 'react-redux';

export function usePermission() {
  const { user } = useSelector(state => state.auth);
  
  return {
    isAdmin: user?.role === 'admin',
    isOC: user?.role === 'oc',
    canAccessFeature: (requiredRoles) => {
      return requiredRoles.includes(user?.role);
    }
  };
}
