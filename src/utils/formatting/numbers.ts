/**
 * Format a number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Parse a string to number, handling invalid input
 */
export const parseNumber = (value: string): number => {
  const num = Number(value.replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
};