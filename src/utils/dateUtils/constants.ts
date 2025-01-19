// Get current date at start of day
const now = new Date();
now.setHours(0, 0, 0, 0);
export const CURRENT_DATE = now;

export const dateRanges = {
  mtd: 'Month to Date',
  monthly: 'Monthly', 
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom Range'
} as const;