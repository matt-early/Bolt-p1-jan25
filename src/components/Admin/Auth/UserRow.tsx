import React from 'react';
import { UserCog } from 'lucide-react';
import { UserProfile, UserRole } from '../../../types/auth';
import { Region } from '../../../types';
import { UserActions } from './UserActions';
import { UserStatus } from './UserStatus';
import { AUTH_SETTINGS } from '../../../config/auth-settings';
import { formatTimestamp } from '../../../utils/dateUtils/timestamps';

interface UserRowProps {
  user: UserProfile;
  users: UserProfile[];
  regions: Region[];
  currentUser: UserProfile | null;
  currentUserRole: string;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  users,
  regions,
  currentUser,
  currentUserRole,
  onRoleChange,
  onSuccess,
  onError
}) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'regional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <tr className={`${user.disabled ? 'opacity-50 bg-gray-50' : ''} transition-opacity duration-200`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <UserCog className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${user.disabled ? 'text-gray-500' : 'text-gray-900'}`}>
              {user.name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.role === AUTH_SETTINGS.ROLES.REGIONAL && user.regionId && (
              <div className="text-xs text-gray-500 mt-1">
                Region: {regions.find(r => r.id === user.regionId)?.name || 'Unknown'}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </span>
        {user.id !== currentUser?.uid && user.disabled && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Disabled
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.staffCode || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatTimestamp(user.lastLoginAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <UserStatus user={user} users={users} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {user.id !== currentUser?.uid && (
          <UserActions
            user={user}
            currentUserRole={currentUserRole}
            onRoleChange={onRoleChange}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
      </td>
    </tr>
  );
};