import React from 'react';
import { AuthRequest } from '../../../../types/auth';
import { Store } from '../../../../types';
import { RequestItem } from './RequestItem';
import { EmptyState } from './EmptyState';

interface RequestListProps {
  requests: AuthRequest[];
  stores: Store[];
  onApprove: (request: AuthRequest) => void;
  onReject: (requestId: string) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  stores,
  onApprove,
  onReject
}) => {
  if (requests.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {requests.map((request) => (
        <RequestItem
          key={request.id}
          request={request}
          stores={stores}
          onApprove={() => onApprove(request)}
          onReject={() => onReject(request.id)}
        />
      ))}
    </ul>
  );
};