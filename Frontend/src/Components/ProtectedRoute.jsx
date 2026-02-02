import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected Route Component
export const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  // ===== NEW: With device auth, all users are automatically authenticated =====
  // Always allow access since device auth auto-authenticates
  // The isAuthenticated check still works but will always be true with device auth
  return isAuthenticated ? element : <Navigate to="/" replace />;
  // ===== END NEW =====
  
  // ===== COMMENTED OUT: Original protected route (redirected to /login) =====
  // return isAuthenticated ? element : <Navigate to="/login" replace />;
  // ===== END COMMENTED OUT =====
};
