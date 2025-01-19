import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleReturn = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force navigation to login even if sign out fails
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have permission to access this page
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Please contact your administrator if you believe this is a mistake.
            </p>
            <button
              onClick={handleReturn}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};