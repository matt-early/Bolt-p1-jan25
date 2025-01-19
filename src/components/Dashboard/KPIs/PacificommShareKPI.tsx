import React from 'react';
import { Bar } from 'react-chartjs-2';
import { SalesMetrics } from '../../../types';
import { getPerformanceLevel } from '../../../utils/performanceUtils';
import { getSupplierName } from '../../../data/suppliers';

interface PacificommShareKPIProps {
  metrics: SalesMetrics[];
}

export const PacificommShareKPI: React.FC<PacificommShareKPIProps> = ({ metrics }) => {
  const thresholds = {
    low: 60,
    medium: 80,
  };

  // Calculate total quantity for suppliers 1-4
  const totalQuantity = metrics
    .filter(m => m.supplierId >= 1 && m.supplierId <= 4)
    .reduce((sum, m) => sum + m.quantity, 0);

  // Calculate Pacificomm quantity
  const pacificommQuantity = metrics
    .filter(m => m.supplierId === 3)
    .reduce((sum, m) => sum + m.quantity, 0);

  const pacificommShare = totalQuantity > 0 
    ? Number((pacificommQuantity / totalQuantity * 100).toFixed(2))
    : 0;

  const performance = getPerformanceLevel(pacificommShare, thresholds);

  const data = {
    labels: [`${getSupplierName(3)} Share`],
    datasets: [
      {
        data: [pacificommShare],
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
              `Share: ${value.toFixed(2)}%`,
              `Status: ${performance.level}`,
              `${getSupplierName(3)} Quantity: ${pacificommQuantity}`,
              `Total Quantity (S1-S4): ${totalQuantity}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: {
          drawBorder: false,
        },
        ticks: {
          callback: (value) => `${Math.round(value)}%`
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
        <h3 className="text-sm font-medium text-gray-900">{getSupplierName(3)} Share of Total Sales</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">&lt;60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">60-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">&gt;80%</span>
          </div>
        </div>
      </div>
      <div className="h-12">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};