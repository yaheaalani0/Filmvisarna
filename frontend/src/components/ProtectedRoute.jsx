import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  // Assume role and token are saved in localStorage after login
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // Save role during login

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;