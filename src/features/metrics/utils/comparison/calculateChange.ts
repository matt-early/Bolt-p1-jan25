export interface ChangeResult {
  absolute: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export const calculateChange = (
  current: number,
  previous: number
): ChangeResult => {
  const absolute = current - previous;
  const percentage = previous !== 0 ? (absolute / previous) : 0;
  
  return {
    absolute,
    percentage,
    trend: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'stable'
  };
};