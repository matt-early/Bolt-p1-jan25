import { KPIThresholds, PerformanceLevel } from '../types';

export const getPerformanceLevel = (value: number, thresholds: KPIThresholds): PerformanceLevel => {
  if (value < thresholds.low) {
    return {
      rate: value,
      level: 'below',
      color: 'rgba(239, 68, 68, 0.7)', // red
    };
  }
  if (value < thresholds.medium) {
    return {
      rate: value,
      level: 'meeting',
      color: 'rgba(234, 179, 8, 0.7)', // yellow
    };
  }
  return {
    rate: value,
    level: 'exceeding',
    color: 'rgba(34, 197, 94, 0.7)', // green
  };
};