import React from 'react';
import { MoreVertical, Key, UserX, UserCheck, Trash2 } from 'lucide-react';
import { UserProfile, UserRole } from '../../../types/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { resetUserPassword, disableUser, enableUser, deleteUser } from '../../../services/admin/userActions';

interface UserActionsProps {
  user: UserProfile;
  currentUserRole: string;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUserRole,
  onRoleChange,
  onSuccess,
  onError
}) => {
  const { currentUser } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handle clicking outside to close menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close if click is outside both button and menu
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when user changes
  React.useEffect(() => {
    setShowMenu(false);
  }, [user.id]);
  const handleResetPassword = async () => {
    try {
      await resetUserPassword(user.email);
      onSuccess();
      setShowMenu(false);
    } catch (error) {
      onError('Failed to reset password');
    }
  };

  const handleDisableUser = async () => {
    if (!window.confirm(
      `Are you sure you want to disable ${user.name}?\n\n` +
      'This will prevent them from logging in until re-enabled.'
    )) return;
    
    try {
      await disableUser(user.id);
      onSuccess();
      setShowMenu(false);
    } catch (error) {
      onError('Failed to disable user');
    }
  };

  const handleEnableUser = async () => {
    try {
      await enableUser(user.id);
      onSuccess();
      setShowMenu(false);
    } catch (error) {
      onError('Failed to enable user');
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(
      `Are you sure you want to permanently delete ${user.name}?\n\n` +
      'This action cannot be undone and will remove all associated data.'
    )) return;
    
    try {
      await deleteUser(user.id);
      onSuccess();
      setShowMenu(false);
    } catch (error) {
      onError('Failed to delete user');
    }
  };

  // Don't show actions for admins unless current user is admin
  if (user.role === 'admin' && currentUserRole !== 'admin') {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={menuButtonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {showMenu && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transform -translate-x-full"
          style={{
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          <div className="py-1">
            {user.id !== currentUser?.uid && (
              <div className="px-4 py-2 border-b">
                <label className="block text-xs font-medium text-gray-700 mb-1">Change Role</label>
                <select
                  value={user.role}
                  onChange={(e) => {
                    onRoleChange(user.id, e.target.value as UserRole);
                    setShowMenu(false);
                  }}
                  className="w-full text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  disabled={user.disabled}
                >
                  <option value="team_member">Team Member</option>
                  <option value="regional">Regional Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              onClick={handleResetPassword}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              title="Send password reset email"
            >
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </button>

            {user.disabled ? (
              <button
                onClick={handleEnableUser}
                className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100 whitespace-nowrap"
                title="Re-enable user access"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Enable User
              </button>
            ) : (
              <button
                onClick={handleDisableUser}
                className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-gray-100 whitespace-nowrap"
                title="Temporarily disable user access"
              >
                <UserX className="w-4 h-4 mr-2" />
                Disable User
              </button>
            )}

            <button
              onClick={handleDeleteUser}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100 whitespace-nowrap"
              title="Permanently delete user"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};