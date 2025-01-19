import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingScreen } from '../common/LoadingScreen'; 

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!currentUser || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};