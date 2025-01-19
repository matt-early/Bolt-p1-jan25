import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check admin role from auth claims
  const isAdmin = currentUser?.customClaims?.admin === true;
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};