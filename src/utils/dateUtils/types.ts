import { dateRanges } from './constants';

export type DateRange = keyof typeof dateRanges;

export interface DateSelection {
  startDate: Date | null;
  endDate: Date | null;
}

export interface SelectedPeriod {
  month?: number;
  quarter?: number;
  year: number;
}