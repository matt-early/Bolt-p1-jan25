import React from 'react';

export const EmptyState: React.FC = () => (
  <div className="p-8 text-center">
    <p className="text-gray-500">No pending authentication requests</p>
    <p className="text-sm text-gray-400 mt-2">
      New requests will appear here when users register
    </p>
  </div>
);