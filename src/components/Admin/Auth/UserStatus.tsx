import React from 'react';
import { UserProfile } from '../../../types/auth';

interface UserStatusProps {
  user: UserProfile;
  users: UserProfile[];
}

export const UserStatus: React.FC<UserStatusProps> = ({ user, users }) => {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date.toLocaleString() : null;
  };

  const getActionUser = (userId: string | undefined) => {
    if (!userId) return null;
    return users.find(u => u.id === userId)?.name || 'Unknown';
  };

  if (user.disabled) {
    const disabledDate = formatDate(user.disabledAt);
    const disabledBy = getActionUser(user.disabledBy);

    return (
      <div className="text-red-600">
        {disabledDate ? (
          <>
            Disabled: {disabledDate}
            {disabledBy && (
              <div className="text-xs text-gray-500 mt-1">
                by {disabledBy}
              </div>
            )}
          </>
        ) : (
          'Disabled: Invalid Date'
        )}
      </div>
    );
  }

  const enabledDate = formatDate(user.enabledAt);
  const enabledBy = getActionUser(user.enabledBy);

  if (enabledDate) {
    return (
      <div className="text-green-600">
        Enabled: {enabledDate}
        {enabledBy && (
          <div className="text-xs text-gray-500 mt-1">
            by {enabledBy}
          </div>
        )}
      </div>
    );
  }

  return null;
}