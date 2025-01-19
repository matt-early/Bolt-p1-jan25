export const formatNumber = (value: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

export const parseNumber = (value: string): number => {
  const cleanValue = value.replace(/[^0-9.-]+/g, '');
  return Number(cleanValue);
};