import React from 'react';
import { CURRENT_DATE } from '../../../utils/dateUtils/constants';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  selectedYear,
  onChange
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get available months (up to current month in current year)
  const availableMonths = months.map((name, index) => ({
    value: index,
    name,
    disabled: selectedYear === CURRENT_DATE.getFullYear() && index > CURRENT_DATE.getMonth()
  }));

  return (
    <select
      value={selectedMonth}
      onChange={(e) => onChange(Number(e.target.value), selectedYear)}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      {availableMonths.map(({ value, name, disabled }) => (
        <option key={value} value={value} disabled={disabled}>
          {name}
        </option>
      ))}
    </select>
  );
};