import React from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { dateRanges, DateRange, getDateRangeLabel } from '../../utils/dateUtils';
import { DateSelection, SelectedPeriod } from '../../types';
import { MonthSelector } from './DateRangeSelector/MonthSelector';
import { QuarterSelector } from './DateRangeSelector/QuarterSelector';
import { YearSelector } from './DateRangeSelector/YearSelector';

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  customRange: DateSelection;
  onCustomRangeChange: (range: DateSelection) => void;
  selectedPeriod: SelectedPeriod;
  onPeriodChange?: (period: { month?: number; quarter?: number; year: number }) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  customRange,
  onCustomRangeChange,
  selectedPeriod,
  onPeriodChange
}) => {
  // Allow historical data selection
  const maxDate = new Date(2024, 11, 11); // December 11, 2024
  const minDate = new Date(2024, 0, 1); // Start of year

  const handleMonthChange = (month: number, year: number) => {
    onPeriodChange({ ...selectedPeriod, month, year });
  };

  const handleQuarterChange = (quarter: number, year: number) => {
    onPeriodChange({ ...selectedPeriod, quarter, year });
  };

  const handleYearChange = (year: number) => {
    onPeriodChange({ ...selectedPeriod, year });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Time Period</h3>
        </div>
        <div className="text-sm text-gray-600">
          {getDateRangeLabel(selectedRange, customRange)}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(dateRanges) as DateRange[]).map((range) => (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${selectedRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {dateRanges[range]}
          </button>
        ))}
      </div>

      {selectedRange === 'monthly' && (
        <div className="flex items-center mt-4 p-4 bg-gray-50 rounded-lg">
          <MonthSelector
            selectedMonth={selectedPeriod.month || 0}
            selectedYear={selectedPeriod.year}
            onChange={handleMonthChange}
          />
          <YearSelector
            selectedYear={selectedPeriod.year}
            onChange={handleYearChange}
          />
        </div>
      )}

      {selectedRange === 'quarterly' && (
        <div className="flex items-center mt-4 p-4 bg-gray-50 rounded-lg">
          <QuarterSelector
            selectedQuarter={selectedPeriod.quarter || 0}
            selectedYear={selectedPeriod.year}
            onChange={handleQuarterChange}
          />
          <YearSelector
            selectedYear={selectedPeriod.year}
            onChange={handleYearChange}
          />
        </div>
      )}

      {selectedRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Start Date</label>
            <DatePicker
              selected={customRange.startDate}
              onChange={(date) => onCustomRangeChange({
                ...customRange,
                startDate: date
              })}
              selectsStart
              startDate={customRange.startDate}
              endDate={customRange.endDate}
              minDate={minDate}
              maxDate={maxDate}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="MMM d, yyyy"
              placeholderText="Select start date"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">End Date</label>
            <DatePicker
              selected={customRange.endDate}
              onChange={(date) => onCustomRangeChange({
                ...customRange,
                endDate: date
              })}
              selectsEnd
              startDate={customRange.startDate}
              endDate={customRange.endDate}
              minDate={customRange.startDate || minDate}
              maxDate={maxDate}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="MMM d, yyyy"
              placeholderText="Select end date"
            />
          </div>
        </div>
      )}
    </div>
  );
};