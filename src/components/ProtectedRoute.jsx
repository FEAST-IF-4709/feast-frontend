// ============================================
// Protected Route — Auth Guard Component
// ============================================
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, hasPermission, isSuperAdmin } from "../api/auth";

const ProtectedRoute = ({ children, permission, redirectTo = "/login" }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // SuperAdmin hanya boleh akses /brands — redirect ke /brands jika coba buka halaman lain
  if (isSuperAdmin() && location.pathname !== "/brands") {
    return <Navigate to="/brands" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
