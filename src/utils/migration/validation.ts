import { UserProfile } from '../../types/auth';

export const validateUserProfile = (data: any): data is UserProfile => {
  return (
    typeof data.email === 'string' &&
    typeof data.name === 'string' &&
    typeof data.role === 'string' &&
    (!data.staffCode || typeof data.staffCode === 'string') &&
    (!data.storeIds || Array.isArray(data.storeIds)) &&
    (!data.primaryStoreId || typeof data.primaryStoreId === 'string')
  );
};