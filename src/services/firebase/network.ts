import { logOperation } from './logging';

export interface NetworkStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  isInitialized: boolean;
  connectionAttempts: number;
  lastAttempt: Date | null;
}

let networkStatus: NetworkStatus = {
  isOnline: navigator.onLine,
  lastOnline: navigator.onLine ? new Date() : null,
  isInitialized: false,
  connectionAttempts: 0,
  lastAttempt: null
};

const MIN_RETRY_INTERVAL = 5000; // Minimum 5 seconds between retries

// Initialize network monitoring immediately
const initializeNetworkStatus = () => {
  const handleOnline = () => {
    networkStatus = {
      isOnline: true,
      lastOnline: new Date(),
      isInitialized: true,
      connectionAttempts: 0,
      lastAttempt: null
    };
    logOperation('network', 'online');
  };

  const handleOffline = () => {
    networkStatus = {
      ...networkStatus,
      isOnline: false,
      isInitialized: true,
      connectionAttempts: networkStatus.connectionAttempts + 1,
      lastAttempt: new Date()
    };
    logOperation('network', 'offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Set initial status
  networkStatus.isInitialized = true;
  networkStatus.isOnline = navigator.onLine;

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Initialize immediately
initializeNetworkStatus();

export const getNetworkStatus = (): NetworkStatus => networkStatus;

export const initNetworkMonitoring = (
  onOnline?: () => void,
  onOffline?: () => void
) => {
  const handleOnline = () => {
    networkStatus.isOnline = true;
    networkStatus.lastOnline = new Date();
    logOperation('network', 'online');
    onOnline?.();
  };

  const handleOffline = () => {
    networkStatus.isOnline = false;
    logOperation('network', 'offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export const waitForNetwork = async (timeout = 30000): Promise<boolean> => {
  if (navigator.onLine) return true;

  const now = Date.now();
  if (networkStatus.lastAttempt) {
    const timeSinceLastAttempt = now - networkStatus.lastAttempt.getTime();
    if (timeSinceLastAttempt < MIN_RETRY_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_RETRY_INTERVAL - timeSinceLastAttempt));
    }
  }

  let timeoutId: NodeJS.Timeout;
  let cleanup: (() => void) | null = null;
  
  return new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      if (cleanup) cleanup();
      resolve(false);
    }, timeout);
    
    const handleOnline = () => {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();
      networkStatus.lastAttempt = new Date();
      resolve(true);
    };

    window.addEventListener('online', handleOnline);
    
    cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
    };
    
    return cleanup;
  });
};