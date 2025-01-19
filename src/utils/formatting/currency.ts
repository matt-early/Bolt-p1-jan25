/**
 * Format a number as currency
 */
export const formatCurrency = (value: number, locale = 'en-NZ', currency = 'NZD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Parse a currency string to number
 */
export const parseCurrency = (value: string): number => {
  const num = Number(value.replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
};