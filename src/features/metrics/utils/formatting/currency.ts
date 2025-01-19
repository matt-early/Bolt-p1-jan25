export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^0-9.-]+/g, '');
  return Number(cleanValue);
};