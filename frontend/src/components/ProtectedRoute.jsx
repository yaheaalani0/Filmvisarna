import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from './AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required
  if (requiredRole) {
    // For admin routes, require admin role
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return <Navigate to="/" />;
    }
    // For user routes, only allow non-admin users
    if (requiredRole === 'user' && userRole === 'admin') {
      return <Navigate to="/admin" />;
    }
  }

  return children;
}

export default ProtectedRoute;