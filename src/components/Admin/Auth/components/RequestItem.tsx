import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { AuthRequest } from '../../../../types/auth';
import { Store } from '../../../../types';
import { formatTimestamp } from '../../../../utils/dateUtils/formatters';
import { Timestamp } from 'firebase/firestore';

interface RequestItemProps {
  request: AuthRequest;
  stores: Store[];
  onApprove: () => void;
  onReject: () => void;
}

export const RequestItem: React.FC<RequestItemProps> = ({
  request,
  stores,
  onApprove,
  onReject
}) => {
  // Get store names
  const primaryStore = stores?.find(s => s.id === request.primaryStoreId);
  const additionalStores = request.storeIds
    .filter(id => id !== request.primaryStoreId)
    .map(id => stores?.find(s => s.id === id))
    .filter((store): store is Store => store !== undefined);

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{request.name}</h4>
          <p className="text-sm text-gray-500">{request.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Requested: {formatTimestamp(request.requestedAt)}
          </p>
          <div className="mt-2 space-y-2">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {request.role}
              </span>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Staff Code: {request.staffCode}
              </span>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Primary Store:</span>{' '}
                {primaryStore ? `${primaryStore.name} (Branch ${primaryStore.branchNumber})` : 'Unknown'}
              </p>
              {additionalStores.length > 0 && (
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Additional Stores:</span>{' '}
                  {additionalStores.map(store => 
                    `${store.name} (Branch ${store.branchNumber})`
                  ).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onApprove}
            className={`
              inline-flex items-center px-3 py-1 border border-transparent 
              text-sm font-medium rounded-md text-white
              ${request.loading 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
              }
            `}
            disabled={request.loading}
          >
            {request.loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-1" />
                Approve
              </>
            )}
          </button>
          <button
            onClick={onReject}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <UserX className="h-4 w-4 mr-1" />
            Reject
          </button>
        </div>
      </div>
    </li>
  );
};