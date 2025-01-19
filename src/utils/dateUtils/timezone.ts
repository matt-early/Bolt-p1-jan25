import { Timestamp } from 'firebase/firestore';
import { logOperation } from '../../services/firebase/logging';

// New Zealand timezone
export const NZ_TIMEZONE = 'Pacific/Auckland';

/**
 * Converts a date to New Zealand timezone while preserving the date
 */
export const toNZDateTime = (date: Date): Date => {
  try {
    // Create a formatter that will output the date in NZ timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: NZ_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    // Get the date parts in NZ timezone
    const parts = formatter.formatToParts(date);
    const nzDateParts = parts.reduce((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = parseInt(part.value, 10);
      }
      return acc;
    }, {} as Record<string, number>);

    // Create a new date using the NZ date parts
    const nzDate = new Date(
      nzDateParts.year,
      nzDateParts.month - 1, // Month is 0-based
      nzDateParts.day
    );
    
    // Set to start of day in NZ time
    nzDate.setHours(0, 0, 0, 0);
    
    logOperation('toNZDateTime', 'success', {
      originalDate: date.toISOString(),
      nzDate: nzDate.toISOString()
    });

    return nzDate;
  } catch (error) {
    logOperation('toNZDateTime', 'error', error);
    return date; // Return original date as fallback
  }
};

/**
 * Creates a Firestore timestamp for a date in NZ timezone
 */
export const createNZTimestamp = (date: Date): Timestamp => {
  const nzDate = toNZDateTime(date);
  return Timestamp.fromDate(nzDate);
};