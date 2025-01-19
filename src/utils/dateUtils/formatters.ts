import { Timestamp } from 'firebase/firestore';
import { DateRange, DateSelection } from './types';
import { dateRanges } from './constants';

export const formatTimestamp = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDistanceToNow = (date: Date): string => {
  const now = new Date(2024, 11, 11); // Use current fixed date
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export const formatLastLogin = (timestamp: string | null | undefined): string => {
  if (!timestamp) return 'Never';
  
  try {
    // Handle ISO string
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', timestamp);
      return 'Never';
    }
    
    return new Intl.DateTimeFormat('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Pacific/Auckland'
    }).format(date);
  } catch (error) {
    console.error('Error formatting last login date:', error);
    return 'Never';
  }
};
export const getDateRangeLabel = (range: DateRange, customRange?: DateSelection): string => {
  if (range === 'custom' && customRange?.startDate && customRange?.endDate) {
    return `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`;
  }
  return dateRanges[range];
};