import { logOperation } from '../../firebase/logging';
import { getNetworkStatus } from '../../firebase/network';

interface NetworkValidationResult {
  isValid: boolean;
  useCachedSession?: boolean;
}

const NETWORK_TIMEOUT = 30000; // 30 seconds

export const validateNetworkState = async (
  initializationGracePeriod: number
): Promise<NetworkValidationResult> => {
  const { isOnline, isInitialized } = getNetworkStatus();
    
  if (!isInitialized) {
    logOperation('validateNetworkState', 'info', { 
      message: 'Network monitoring initializing',
      gracePeriod: initializationGracePeriod 
    });
    
    // Wait for network with timeout
    const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
    if (!hasNetwork) {
      return {
        isValid: false,
        useCachedSession: !!sessionStorage.getItem('isAuthenticated')
      };
    }
  }

  if (!isOnline) {
    const hasCachedSession = !!sessionStorage.getItem('isAuthenticated');
    logOperation('validateNetworkState', 'info', { 
      message: 'Offline - using cached session',
      hasCachedSession
    });
    return {
      isValid: false,
      useCachedSession: hasCachedSession
    };
  }

  return { isValid: true };
};

export const waitForNetwork = async (timeout = 30000): Promise<boolean> => {
  if (navigator.onLine) return true;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), timeout);
    
    const handleOnline = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      resolve(true);
    };

    window.addEventListener('online', handleOnline);
  });
};