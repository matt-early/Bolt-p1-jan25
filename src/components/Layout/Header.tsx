import React from 'react';
import { User, Store, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  salesPersonName: string;
  storeName: string;
  regionName: string;
}

export const Header: React.FC<HeaderProps> = ({ salesPersonName, storeName, regionName }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-900 font-medium">{salesPersonName}</span>
            </div>
            <div className="flex items-center">
              <Store className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-600">{storeName}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-600">{regionName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};