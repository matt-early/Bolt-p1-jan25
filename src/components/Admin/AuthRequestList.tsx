import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, AlertCircle } from 'lucide-react';
import { AuthRequest } from '../../types/auth';
import { fetchPendingAuthRequests, approveAuthRequest, rejectAuthRequest } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

export const AuthRequestList: React.FC = () => {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        if (!currentUser) return;
        const data = await fetchPendingAuthRequests(currentUser.uid);
        setRequests(data);
      } catch (err) {
        setError('Failed to load authentication requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [currentUser]);

  const handleApprove = async (requestId: string) => {
    try {
      if (!currentUser) return;
      const tempPassword = Math.random().toString(36).slice(-8);
      await approveAuthRequest(requestId, currentUser.uid, tempPassword);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      if (!currentUser) return;
      await rejectAuthRequest(requestId, currentUser.uid, 'Request rejected by admin');
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Pending Authentication Requests
        </h3>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {requests.map((request) => (
          <li key={request.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{request.name}</h4>
                <p className="text-sm text-gray-500">{request.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Requested: {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Reject
                </button>
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {request.role}
              </span>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Store ID: {request.storeId}
              </span>
            </div>
          </li>
        ))}
        {requests.length === 0 && (
          <li className="px-4 py-8 text-center text-gray-500">
            No pending authentication requests
          </li>
        )}
      </ul>
    </div>
  );
};