export const logOperation = (operation: string, status: 'start' | 'success' | 'error' | 'warning', data?: any) => {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] Firebase operation: ${operation} - ${status}`;
  
  if (status === 'error') {
    console.error(message, data || '');
    if (data?.indexUrl) {
      console.error('Index URL:', data.indexUrl);
    }
  } else if (status === 'warning') {
    console.warn(message, data || '');
  } else {
    console.log(message, data || '');
  }
};

export const logCollectionCount = (collection: string, count: number) => {
  console.log(`[${new Date().toISOString()}] Collection ${collection} count: ${count}`);
};