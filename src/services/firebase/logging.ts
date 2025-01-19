// Production-safe logging utility
export const logOperation = (operation: string, status: 'start' | 'success' | 'error' | 'warning', data?: any) => {
  // Only log errors in production
  if (import.meta.env.PROD && status !== 'error') {
    return;
  }

  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] Firebase operation: ${operation} - ${status}`;
  
  if (status === 'error') {
    console.error(message, data || '');
    // Could add production error reporting service here
  } else if (import.meta.env.DEV) {
    if (status === 'warning') {
      console.warn(message, data || '');
    } else {
      console.log(message, data || '');
    }
  }
};