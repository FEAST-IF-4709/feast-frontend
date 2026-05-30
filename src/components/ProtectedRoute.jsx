// ============================================
// Protected Route — Auth Guard Component
// ============================================
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, hasPermission } from "../api/auth";

/**
 * Wrapper component that protects routes requiring authentication.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children — The component to render if authenticated
 * @param {string} [props.permission] — Optional permission codename to check
 * @param {string} [props.redirectTo="/login"] — Where to redirect if not authenticated
 */
const ProtectedRoute = ({ children, permission, redirectTo = "/login" }) => {
  const location = useLocation();

  // Not logged in → redirect to login
  if (!isLoggedIn()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Logged in but missing required permission
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
