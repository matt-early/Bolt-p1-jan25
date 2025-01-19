import React, { useState, useEffect } from 'react';
import { UserCog, Trash2, Shield, Plus } from 'lucide-react';
import { UserProfile, UserRole } from '../../../types/auth';
import { Region } from '../../../types';
import { fetchUsers, updateUserRole } from '../../../services/admin/userManagement';
import { migrateSalespeopleToUsers } from '../../../services/admin/migration'; 
import { fetchRegions } from '../../../services/regions';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRow } from './UserRow';
import { AddUserModal } from './AddUserModal';
import { UserActions } from './UserActions';
import { AUTH_SETTINGS } from '../../../config/auth-settings';
import { deleteUser } from '../../../services/admin/userActions';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const currentUserProfile = auth?.userProfile;

  useEffect(() => {
    loadUsers();
  }, []);

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setError(null);
      await migrateSalespeopleToUsers();
      await loadUsers(); // Reload users after migration
    } catch (err) {
      setError('Failed to migrate salespeople to users');
    } finally {
      setIsMigrating(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, regionsData] = await Promise.all([
        fetchUsers(),
        fetchRegions()
      ]);
      setUsers(data);
      setRegions(regionsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users and regions';
      setError(message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setError(null);

      // If changing to regional manager, require region selection
      if (newRole === AUTH_SETTINGS.ROLES.REGIONAL) {
        const region = prompt('Please enter the region ID for this regional manager:');
        if (!region) {
          setError('Region ID is required for regional managers');
          return;
        }
        // Validate region exists
        if (!regions.find(r => r.id === region)) {
          setError('Invalid region ID');
          return;
        }
        await updateUserRole(userId, newRole, region);
      } else {
        await updateUserRole(userId, newRole);
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update user role');
      console.error('Error updating user role:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.uid) {
      setError('Cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      setError(null);
    } catch (err) {
      setError('Failed to delete user');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex gap-4">
          <button
            onClick={handleMigration}
            disabled={isMigrating}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isMigrating ? 'Migrating...' : 'Migrate Salespeople'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  users={users}
                  regions={regions}
                  currentUser={currentUser}
                  currentUserRole={currentUserProfile?.role || 'team_member'}
                  onRoleChange={handleRoleChange}
                  onSuccess={loadUsers}
                  onError={setError}
                />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        regions={regions}
        onUserAdded={(newUser) => {
          setUsers([...users, newUser]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};