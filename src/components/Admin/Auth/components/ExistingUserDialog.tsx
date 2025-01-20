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
  onDelete?: () => void;
}

export const ExistingUserDialog: React.FC<ExistingUserDialogProps> = ({
  email,
  details,
  onClose,
  onDelete
}) => {
  const hasAuthOnly = details.auth && !details.users && !details.sales;

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
              {details?.uid && <span className="block mt-1 text-xs text-gray-500">User ID: {details.uid}</span>}
            </p>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${details?.auth ? 'bg-yellow-400' : 'bg-gray-300'} mr-2`} />
              <span className="text-sm">
                Firebase Authentication Account
                {details?.auth && <span className="ml-2 text-yellow-600 text-xs">(Exists)</span>}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${details?.users ? 'bg-red-400' : 'bg-gray-300'} mr-2`} />
              <span className="text-sm">
                User Profile
                {!details?.users && <span className="ml-2 text-gray-500 text-xs">(Not Created)</span>}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${details?.sales ? 'bg-red-400' : 'bg-gray-300'} mr-2`} />
              <span className="text-sm">
                Team Member Profile
                {!details?.sales && <span className="ml-2 text-gray-500 text-xs">(Not Created)</span>}
              </span>
            </div>
          </div>

          {hasAuthOnly ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-yellow-700">
                    This email has an existing Firebase Authentication account but no user profiles.
                  </div>
                  <p className="mt-2 text-sm text-yellow-700">
                    The existing account must be deleted before creating a new one.
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
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Delete & Create New
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}