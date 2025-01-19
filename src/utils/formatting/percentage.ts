/**
 * Format a decimal number as a percentage string
 * @param value Decimal value (e.g., 0.75 for 75%)
 * @param decimals Number of decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Parse a percentage string to its decimal value
 * @param value Percentage string (e.g., "75%")
 */
export const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace('%', ''));
  return isNaN(num) ? 0 : num / 100;
};