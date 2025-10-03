import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireApproved = false, requireAdmin = false }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const token = localStorage.getItem('authToken');
  const supplierId = localStorage.getItem('supplierId');
  const userRole = localStorage.getItem('userRole');
  const supplierStatus = localStorage.getItem('supplierStatus');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/supllierLogin" state={{ from: location }} replace />;
  }

  // For admin routes, do not require supplierId
  if (!requireAdmin && !supplierId) {
    return <Navigate to="/supplierLogin" state={{ from: location }} replace />;
  }

  // If admin route is required but user is not admin
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  // If approved supplier route is required but supplier is not approved
  if (requireApproved && supplierStatus !== 'approved') {
    return <Navigate to="/login" state={{ 
      from: location, 
      message: 'Your account is pending admin approval.' 
    }} replace />;
  }

  return children;
};

export default ProtectedRoute;
