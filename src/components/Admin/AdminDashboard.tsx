import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Welcome to the admin dashboard. Use the sidebar to navigate between different sections.</p>
        </div>
      </div>
    </div>
  );
};