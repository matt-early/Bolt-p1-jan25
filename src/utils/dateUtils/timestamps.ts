import { Timestamp } from 'firebase/firestore';
import { logOperation } from '../../services/firebase/logging';

export const normalizeTimestamp = (timestamp: string | Timestamp | { seconds: number; nanoseconds: number } | null | undefined): string | null => {
  try {
    if (!timestamp) return null;
    
    let date: Date;

    // Handle Firebase Timestamp object
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    }
    // Handle timestamp-like object
    else if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Handle ISO string
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    else {
      return null;
    }

    // Validate date
    if (isNaN(date.getTime())) {
      logOperation('normalizeTimestamp', 'warning', 'Invalid date');
      return null;
    }

    return date.toISOString();
  } catch (error) {
    logOperation('normalizeTimestamp', 'error', { timestamp, error });
    return null;
  }
};

export const formatTimestamp = (timestamp: string | Timestamp | { seconds: number; nanoseconds: number } | null | undefined): string => {
  const normalized = normalizeTimestamp(timestamp);
  if (!normalized) return 'Never';

  try {
    return new Intl.DateTimeFormat('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Pacific/Auckland'
    }).format(new Date(normalized));
  } catch (error) {
    logOperation('formatTimestamp', 'error', error);
    return 'Never';
  }
};