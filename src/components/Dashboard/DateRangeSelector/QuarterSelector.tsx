import React from 'react';
import { CURRENT_DATE } from '../../../utils/dateUtils/constants';

interface QuarterSelectorProps {
  selectedQuarter: number;
  selectedYear: number;
  onChange: (quarter: number, year: number) => void;
}

export const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  selectedQuarter,
  selectedYear,
  onChange
}) => {
  const currentQuarter = Math.floor(CURRENT_DATE.getMonth() / 3);
  
  const quarters = [
    { value: 0, label: 'Q1 (Jan-Mar)' },
    { value: 1, label: 'Q2 (Apr-Jun)' },
    { value: 2, label: 'Q3 (Jul-Sep)' },
    { value: 3, label: 'Q4 (Oct-Dec)' }
  ];

  // Disable future quarters in current year
  const availableQuarters = quarters.map(quarter => ({
    ...quarter,
    disabled: selectedYear === CURRENT_DATE.getFullYear() && quarter.value > currentQuarter
  }));

  return (
    <select
      value={selectedQuarter}
      onChange={(e) => onChange(Number(e.target.value), selectedYear)}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      {availableQuarters.map(({ value, label, disabled }) => (
        <option key={value} value={value} disabled={disabled}>
          {label}
        </option>
      ))}
    </select>
  );
};