import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // Check if user is authenticated
  if (!token || !userData) {
    return <Navigate to="/supplierLogin" replace />;
  }
  
  const user = JSON.parse(userData);
  
  // Check if user has required role (if specified)
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardRoutes = {
      "customer": "/dashboard/customer",
      "shop_owner": "/dashboard/shop",
      "supplier_admin": "/dashboard/supplier", 
      "inventory_manager": "/dashboard/inventory",
      "delivery_admin": "/drivers/management", // Redirect delivery admin to driver management
      "admin": "/dashboard/admin"
    };
    
    const redirectPath = dashboardRoutes[user.role] || "/dashboard/customer";
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;

