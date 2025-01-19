import { SalesMetrics, DateSelection } from '../../types';
import { DateRange } from './types';
import { CURRENT_DATE } from './constants';
import { getMonthDates, getQuarterDates, getYearDates } from './ranges';

export const isInDateRange = (
  date: string,
  range: DateRange,
  customRange?: DateSelection,
  selectedPeriod?: { month?: number; quarter?: number; year: number }
): boolean => {
  const targetDate = new Date(date);
  const now = CURRENT_DATE;
  
  if (range === 'custom' && customRange?.startDate && customRange?.endDate) {
    const start = new Date(customRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customRange.endDate);
    end.setHours(23, 59, 59, 999);
    return targetDate >= start && targetDate <= end;
  }
  
  switch (range) {
    case 'mtd':
      return targetDate.getMonth() === now.getMonth() &&
            targetDate.getFullYear() === now.getFullYear() &&
            targetDate.getDate() <= now.getDate();

    case 'monthly': {
      if (!selectedPeriod?.month || !selectedPeriod?.year) return false;
      const { startDate, endDate } = getMonthDates(selectedPeriod.month, selectedPeriod.year);
      return targetDate >= startDate && targetDate <= endDate;
    }

    case 'quarterly': {
      if (!selectedPeriod?.quarter || !selectedPeriod?.year) return false;
      const { startDate, endDate } = getQuarterDates(selectedPeriod.quarter, selectedPeriod.year);
      return targetDate >= startDate && targetDate <= endDate;
    }

    case 'yearly': {
      if (!selectedPeriod?.year) return false;
      const { startDate, endDate } = getYearDates(selectedPeriod.year);
      return targetDate >= startDate && targetDate <= endDate;
    }

    default:
      return false;
  }
};

export const filterMetricsByDateRange = (
  metrics: SalesMetrics[],
  range: DateRange,
  customRange?: DateSelection,
  selectedPeriod?: { month?: number; quarter?: number; year: number }
): SalesMetrics[] => {
  return metrics.filter(metric => 
    isInDateRange(metric.date, range, customRange, selectedPeriod)
  );
};