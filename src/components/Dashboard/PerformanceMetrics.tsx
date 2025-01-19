import React from 'react';
import { BarChart3, TrendingUp, Package, TrendingDown } from 'lucide-react';
import { SalesMetrics, DateSelection } from '../../types';
import { DateRange, filterMetricsByDateRange } from '../../utils/dateUtils';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatting/index';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  comparison: {
    value: number;
    percentage: number;
    label: string;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, comparison }) => (
  <div className="bg-white rounded-lg p-6 shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {comparison && (
          <p className="flex items-center text-sm mt-2">
            <span className="text-gray-500 mr-2">{comparison.label}:</span>
            <span className={comparison.percentage > 0 ? 'text-green-600' : 'text-red-600'}>
              {comparison.percentage > 0 ? (
                <TrendingUp className="w-4 h-4 inline mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 inline mr-1" />
              )}
              {formatPercentage(Math.abs(comparison.percentage))}
            </span>
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

interface PerformanceMetricsProps {
  metrics: SalesMetrics[];
  dateRange: DateRange;
  customRange?: DateSelection;
  selectedPeriod?: {
    month?: number;
    quarter?: number;
    year: number;
  };
}

const calculateComparison = (
  currentMetrics: SalesMetrics[],
  previousMetrics: SalesMetrics[],
  dateRange: DateRange
): { value: number; percentage: number; label: string } => {
  const current = currentMetrics.reduce((sum, m) => sum + m.salesAmount, 0);
  const previous = previousMetrics.reduce((sum, m) => sum + m.salesAmount, 0);
  
  const difference = current - previous;
  const percentage = previous !== 0 ? (difference / previous) : 0;
  
  let label = '';
  switch (dateRange) {
    case 'mtd':
      label = 'vs Last Month';
      break;
    case 'monthly':
      label = 'vs Previous Month';
      break;
    case 'quarterly':
      label = 'vs Previous Quarter';
      break;
    case 'yearly':
      label = 'vs Previous Year';
      break;
    default:
      label = 'vs Previous Period';
  }
  
  return { value: difference, percentage, label };
};

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  dateRange,
  customRange,
  selectedPeriod
}) => {
  const filteredMetrics = filterMetricsByDateRange(metrics, dateRange, customRange, selectedPeriod);
  
  // Get previous period metrics for comparison
  const getPreviousPeriodRange = () => {
    const currentDate = new Date();
    switch (dateRange) {
      case 'mtd':
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() - 3);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }
    return currentDate;
  };

  const previousMetrics = filterMetricsByDateRange(
    metrics,
    dateRange,
    customRange || { startDate: getPreviousPeriodRange(), endDate: new Date() },
    selectedPeriod
  );
  
  const totals = filteredMetrics.reduce((acc, metric) => ({
    quantity: acc.quantity + metric.quantity,
    salesAmount: acc.salesAmount + metric.salesAmount,
    marginAmount: acc.marginAmount + metric.marginAmount,
  }), { quantity: 0, salesAmount: 0, marginAmount: 0 });
  
  const salesComparison = calculateComparison(filteredMetrics, previousMetrics, dateRange);
  const marginComparison = calculateComparison(
    filteredMetrics.map(m => ({ ...m, salesAmount: m.marginAmount })),
    previousMetrics.map(m => ({ ...m, salesAmount: m.marginAmount })),
    dateRange
  );
  const quantityComparison = calculateComparison(
    filteredMetrics.map(m => ({ ...m, salesAmount: m.quantity })),
    previousMetrics.map(m => ({ ...m, salesAmount: m.quantity })),
    dateRange
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Sales"
        value={formatCurrency(totals.salesAmount)}
        icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        comparison={salesComparison}
      />
      <MetricCard
        title="Margin"
        value={formatCurrency(totals.marginAmount)}
        icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        comparison={marginComparison}
      />
      <MetricCard
        title="Units Sold"
        value={formatNumber(totals.quantity)}
        icon={<Package className="w-6 h-6 text-blue-600" />}
        comparison={quantityComparison}
      />
    </div>
  );
};