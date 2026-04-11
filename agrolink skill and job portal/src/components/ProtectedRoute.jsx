import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;
  
  if (!user || !user.role) {
    dispatch(logout());
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access an unauthorized route
    if (user.role === 'Admin') return <Navigate to="/mandi-admin" replace />;
    if (user.role === 'Farmer') return <Navigate to="/mandi-dashboard" replace />;
    if (user.role === 'Buyer') return <Navigate to="/marketplace" replace />;
    if (user.role === 'Driver') return <Navigate to="/driver-dashboard" replace />;
    
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
