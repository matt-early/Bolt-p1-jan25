/**
 * Parses a date string in dd/mm/yyyy format and returns a Date object
 */
export const parseDateString = (value: string): Date | null => {
  try {
    // Clean up the input
    const cleanValue = value.trim();
    
    // Check for dd/mm/yyyy format
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = cleanValue.match(dateRegex);
    
    if (!match) return null;
    
    const [_, day, month, year] = match;
    
    // Parse components
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10) - 1; // Months are 0-based
    const yearNum = parseInt(year, 10);
    
    // Validate ranges
    if (monthNum < 0 || monthNum > 11) return null;
    if (dayNum < 1 || dayNum > 31) return null;
    if (yearNum < 1900 || yearNum > 2100) return null;
    
    // Create date object
    const date = new Date(yearNum, monthNum, dayNum);
    
    // Validate the resulting date
    if (isNaN(date.getTime())) return null;
    if (date.getDate() !== dayNum || date.getMonth() !== monthNum || date.getFullYear() !== yearNum) {
      return null; // Invalid date (e.g., 31/04/2024)
    }
    
    // Set time to midnight
    date.setHours(0, 0, 0, 0);
    
    return date;
  } catch {
    return null;
  }
};

/**
 * Formats a date to dd/mm/yyyy string
 */
export const formatDateToString = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};