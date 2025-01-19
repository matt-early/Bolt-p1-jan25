import React from 'react';
import { Bar } from 'react-chartjs-2';
import { SalesMetrics, DateRange } from '../../../types';
import { calculateAverageSalesPerUnit } from '../../../utils/calculationUtils';
import { getPerformanceLevel } from '../../../utils/performanceUtils';

interface AverageSalesKPIProps {
  metrics: SalesMetrics[];
  dateRange: DateRange;
}

export const AverageSalesKPI: React.FC<AverageSalesKPIProps> = ({
  metrics,
  dateRange,
}) => {
  const thresholds = {
    low: 30,
    medium: 40,
  };

  const avgSalesPerUnit = calculateAverageSalesPerUnit(metrics);
  const performance = getPerformanceLevel(avgSalesPerUnit, thresholds);

  const data = {
    labels: ['Average Sales Per Unit'],
    datasets: [
      {
        data: [avgSalesPerUnit],
        backgroundColor: performance.color,
        borderWidth: 1,
        borderColor: performance.color.replace('0.7', '1'),
        barThickness: 30,
      }
    ]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return [
              `ASP: $${value.toFixed(2)}`,
              `Status: ${performance.level}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        min: 0,
        max: Math.max(50, avgSalesPerUnit),
        grid: {
          drawBorder: false,
        },
        ticks: {
          callback: (value) => `$${Math.round(value)}`
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Average Sales Per Unit (ASP)</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">&lt;$30</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">$30-$40</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">&gt;$40</span>
          </div>
        </div>
      </div>
      <div className="h-12">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};