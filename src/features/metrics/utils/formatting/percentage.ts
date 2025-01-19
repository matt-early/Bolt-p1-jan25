export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const parsePercentage = (value: string): number => {
  const cleanValue = value.replace(/[^0-9.-]+/g, '');
  return Number(cleanValue) / 100;
};