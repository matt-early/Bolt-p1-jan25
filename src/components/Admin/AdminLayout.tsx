import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../providers/AuthProvider';
import { useEffect } from 'react';

export const AdminLayout: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    
    if (userProfile.role !== 'admin') {
      navigate(`/${userProfile.role}`);
      return;
    }
  }, [userProfile, navigate]);

  // Show loading or redirect for non-admin users
  if (!userProfile) {
    return null;
  }

  const getPortalTitle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin Portal';
      case 'regional':
        return 'Regional Portal';
      default:
        return 'Team Portal';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        userProfile={userProfile}
        onSignOut={signOut}
        portalTitle={getPortalTitle(userProfile.role)}
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};