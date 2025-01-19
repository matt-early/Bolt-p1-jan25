import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserRole } from '../../../types/auth';
import { Region } from '../../../types';
import { createUser } from '../../../services/admin';
import { AUTH_SETTINGS } from '../../../config/auth-settings';

import { logOperation } from '../../../services/firebase/logging';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
  regions: Region[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
  regions
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'team_member' as UserRole,
    staffCode: '',
    password: '',
    regionId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        name: '',
        role: 'team_member',
        staffCode: '',
        password: '',
        regionId: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logOperation('AddUserModal.handleSubmit', 'start');
    setError('');
    setLoading(true);

    if (!formData.email || !formData.name || !formData.password) {
      logOperation('AddUserModal.handleSubmit', 'error', 'Missing required fields');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate region selection for regional managers
    if (formData.role === AUTH_SETTINGS.ROLES.REGIONAL && !formData.regionId) {
      logOperation('AddUserModal.handleSubmit', 'error', 'Missing region for regional manager');
      setError('Region selection is required for Regional Managers');
      setLoading(false);
      return;
    }

    // Validate region exists
    if (formData.role === AUTH_SETTINGS.ROLES.REGIONAL) {
      const region = regions.find(r => r.id === formData.regionId);
      if (!region) {
        setError('Selected region does not exist');
        setLoading(false);
        return;
      }
    }
    
    try {
      // Create user with all required data
      logOperation('AddUserModal.handleSubmit', 'creating-user');
      const newUser = await createUser({
        email: formData.email.toLowerCase().trim(),
        name: formData.name.trim(),
        password: formData.password,
        role: formData.role,
        staffCode: formData.staffCode.trim(),
        regionId: formData.role === 'regional' ? formData.regionId : undefined
      });

      logOperation('AddUserModal.handleSubmit', 'success', { userId: newUser.id });
      onUserAdded(newUser);
      onClose(); // Close modal on success
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        role: 'team_member',
        staffCode: '',
        password: '',
        regionId: ''
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      logOperation('AddUserModal.handleSubmit', 'error', { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium">Add New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="team_member">Team Member</option>
                <option value="regional">Regional Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Region selection - only shown for regional managers */}
            {formData.role === AUTH_SETTINGS.ROLES.REGIONAL && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <select
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Staff Code
              </label>
              <input
                type="text"
                value={formData.staffCode}
                onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Initial Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};