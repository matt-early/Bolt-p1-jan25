import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../providers/AuthProvider';

export const AdminLayout: React.FC = () => {
  const { userProfile, signOut } = useAuth();

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
        portalTitle={getPortalTitle(userProfile?.role || 'team_member')}
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};