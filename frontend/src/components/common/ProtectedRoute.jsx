/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 * Checks role-based access
 */

import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  // Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (if roles are specified)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
