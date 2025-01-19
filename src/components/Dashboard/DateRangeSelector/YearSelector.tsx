import React from 'react';
import { CURRENT_DATE } from '../../../utils/dateUtils/constants';

interface YearSelectorProps {
  selectedYear: number;
  onChange: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onChange
}) => {
  // Generate list of years from 2024 up to current year
  const years = Array.from(
    { length: CURRENT_DATE.getFullYear() - 2023 },
    (_, i) => 2024 + i
  );

  return (
    <select
      value={selectedYear}
      onChange={(e) => onChange(Number(e.target.value))}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ml-2"
    >
      {years.map(year => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};