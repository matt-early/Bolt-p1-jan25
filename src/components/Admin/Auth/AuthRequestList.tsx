import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, AlertCircle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import type { AuthRequest, UserProfile } from '../../../types/auth';
import { Store } from '../../../types';
import { 
  fetchPendingAuthRequests, 
  approveAuthRequest, 
  rejectAuthRequest 
} from '../../../services/auth';
import { fetchStores } from '../../../services/stores';
import { useAuth } from '../../../providers/AuthProvider';
import { RequestList } from './components/RequestList';
import { ErrorDisplay } from './components/ErrorDisplay';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { SuccessNotification } from '../../common/SuccessNotification';

// Define extended request type with loading and force continue flags
interface ExtendedAuthRequest extends AuthRequest {
  loading?: boolean;
  forceContinue?: boolean;
}

// Define approval data type
interface ApprovalData extends Omit<UserProfile, 'id' | 'approved' | 'createdAt'> {
  forceContinue?: boolean;
}

interface ExistingUserDetails {
  email: string;
  details: { 
    auth: boolean; 
    users: boolean; 
    sales: boolean;
    uid?: string;
  };
  request: ExtendedAuthRequest;
}

export const AuthRequestList: React.FC = () => {
  const [requests, setRequests] = useState<ExtendedAuthRequest[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [existingUserDetails, setExistingUserDetails] = useState<ExistingUserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Load requests when component mounts or currentUser changes
  useEffect(() => {
    if (!currentUser?.uid) {
      navigate('/login');
      return;
    }
    
    loadRequests();
  }, [currentUser, navigate]);

  const loadRequests = async () => {
    try {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      const [data, storesData] = await Promise.all([
        fetchPendingAuthRequests(),
        fetchStores()
      ]);
      
      // Only update state if component is still mounted and user is still authenticated
      if (currentUser) {
        setRequests(data);
        setStores(storesData);
      }
      
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load authentication requests';
      if (message.includes('permission-denied')) {
        navigate('/unauthorized');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: ExtendedAuthRequest) => {
    try {
      if (!currentUser) {
        navigate('/login');
        setError('Not authenticated');
        return;
      }

      setSuccessMessage(null);
      setError(null);

      // Set loading state for this request
      setRequests(prev => 
        prev.map(r => r.id === request.id ? { ...r, loading: true } : r)
      );

      try {
        const approvalData: ApprovalData = {
          email: request.email.toLowerCase().trim(),
          name: request.name,
          role: request.role,
          storeIds: request.storeIds,
          primaryStoreId: request.primaryStoreId,
          staffCode: request.staffCode,
          forceContinue: request.forceContinue
        };

        const result = await approveAuthRequest(request.id, currentUser.uid, approvalData);

        if (result.existingUser) {
          setExistingUserDetails({
            email: request.email,
            details: result.existingUser,
            request
          });
          setRequests(prev => 
            prev.map(r => r.id === request.id ? { ...r, loading: false } : r)
          );
          return;
        }

        if (result.success) {
          setRequests(prev => prev.filter(r => r.id !== request.id));
          setSuccessMessage(
            `Successfully approved ${request.name}'s request.\nA password reset email has been sent to ${request.email}.`
          );
          await loadRequests(); // Refresh the list
        } else {
          setError(result.error || 'Failed to approve request');
        }
      } catch (err) {
        let message = 'Failed to approve request';
        
        if (err instanceof Error && err.message.includes('permission-denied')) {
          navigate('/unauthorized');
          return;
        } else if (err instanceof Error) {
          message = err.message;
        }
        
        setError(message);
      }
    } catch (err) {
      let message = 'Failed to approve request';
      
      if (err instanceof Error) {
        if (err.message.includes('permission-denied')) {
          navigate('/unauthorized');
          return;
        }
        message = err.message;
      }
      
      setError(message);
    } finally {
      setRequests(prev => 
        prev.map(r => r.id === request.id ? { ...r, loading: false } : r)
      );
    }
  };

  const handleDeleteExistingAccount = async () => {
    if (!existingUserDetails?.details.uid) {
      setError('No user ID available for deletion');
      return;
    }

    if (!window.confirm(
      'Are you sure you want to delete the existing authentication account? ' +
      'This action cannot be undone.'
    )) {
      return;
    }

    try {
      const functions = getFunctions();
      const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');
      await deleteAuthUser({ uid: existingUserDetails.details.uid });

      // After successful deletion, continue with approval
      await handleApprove({
        ...existingUserDetails.request,
        forceContinue: true
      });
      setExistingUserDetails(null);
    } catch (error) {
      setError('Failed to delete existing account. Please try again.');
    }
  };
  const handleReject = async (requestId: string) => {
    try {
      if (!currentUser) return;
      setSuccessMessage(null);
      setError(null);
      
      const request = requests.find(r => r.id === requestId);
      if (!request) return;
      
      await rejectAuthRequest(requestId, currentUser.uid, 'Request rejected by admin');
      setRequests(requests.filter(r => r.id !== requestId));
      
      setSuccessMessage(`Successfully rejected ${request.name}'s request`);
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      {successMessage && (
        <SuccessNotification 
          message={successMessage}
          onClose={clearSuccessMessage}
        />
      )}

      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Pending Authentication Requests
        </h3>
      </div>
      {error && (
        <ErrorDisplay message={error} />
      )}

      <RequestList
        requests={requests}
        stores={stores}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      
      {existingUserDetails && (
        <ExistingUserDialog
          email={existingUserDetails.email}
          details={existingUserDetails.details}
          onClose={() => setExistingUserDetails(null)}
          onDelete={handleDeleteExistingAccount}
        />
      )}
    </div>
  );
};