import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingScreen } from '../common/LoadingScreen';
import { logOperation } from '../../services/firebase/logging';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, userProfile, loading, error } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';


  if (error) {
    logOperation('PrivateRoute', 'error', error);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is authenticated
  if (!currentUser || !userProfile) {
    logOperation('PrivateRoute', 'redirect', 'Not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};