import { CURRENT_DATE } from './constants';

export const getQuarterDates = (quarter: number, year: number) => {
  const startMonth = quarter * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);
  
  // Ensure end date doesn't exceed current date
  if (endDate > CURRENT_DATE) {
    endDate.setTime(CURRENT_DATE.getTime());
  }
  
  return { startDate, endDate };
};

export const getMonthDates = (month: number, year: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  // Ensure end date doesn't exceed current date
  if (endDate > CURRENT_DATE) {
    endDate.setTime(CURRENT_DATE.getTime());
  }
  
  return { startDate, endDate };
};

export const getYearDates = (year: number) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Ensure end date doesn't exceed current date
  if (endDate > CURRENT_DATE) {
    endDate.setTime(CURRENT_DATE.getTime());
  }
  
  return { startDate, endDate };
};