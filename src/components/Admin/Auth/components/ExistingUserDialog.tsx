import React from 'react';
import { X } from 'lucide-react';

interface ExistingUserDialogProps {
  email: string;
  details: {
    auth: boolean;
    users: boolean;
    sales: boolean;
    uid?: string;
  };
  onClose: () => void;
  onContinue: () => void;
  onDelete?: () => void;
}

export const ExistingUserDialog: React.FC<ExistingUserDialogProps> = ({
  email,
  details,
  onClose,
  onContinue,
  onDelete
}) => {
  const hasAuthOnly = details.auth && !details.users && !details.sales;
  const hasProfiles = details.users || details.sales;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Existing Account Found
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              The email address <span className="font-medium">{email}</span> is already registered in our system.
            </p>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${details.auth ? 'bg-yellow-400' : 'bg-gray-300'} mr-2`} />
              <span className="text-sm">Firebase Authentication Account</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${details.users ? 'bg-red-400' : 'bg-gray-300'} mr-2`} />
              <span className="text-sm">User Profile</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${details.sales ? 'bg-red-400' : 'bg-gray-300'} mr-2`} />
              <span className="text-sm">Team Member Profile</span>
            </div>
          </div>

          {hasAuthOnly ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This email has an authentication account but no user profiles. You can:
                    <ul className="list-disc ml-4 mt-2">
                      <li>Continue to create new profiles using the existing account</li>
                      <li>Delete the existing account and create a new one</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          ) : hasProfiles ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    This email already has active profiles in the system. The user may be disabled or require administrator assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {hasAuthOnly && (
              <>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Delete Account
                </button>
                <button
                  onClick={onContinue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Use Existing Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}