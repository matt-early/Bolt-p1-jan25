import React from 'react';
import { Bar } from 'react-chartjs-2';
import { SalesMetrics } from '../../../types';
import { getPerformanceLevel } from '../../../utils/performanceUtils';

interface AttachmentRateKPIProps {
  metrics: SalesMetrics[];
  deviceSupplierQuantity: number;
}

export const AttachmentRateKPI: React.FC<AttachmentRateKPIProps> = ({
  metrics,
  deviceSupplierQuantity,
}) => {
  const thresholds = {
    low: 150,
    medium: 170,
  };

  // Calculate combined total quantity for suppliers 1-4
  const totalQuantity = metrics
    .filter(m => m.supplierId >= 1 && m.supplierId <= 4)
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const combinedRate = deviceSupplierQuantity > 0 
    ? Number((totalQuantity / deviceSupplierQuantity * 100).toFixed(2)) 
    : 0;

  const performance = getPerformanceLevel(combinedRate, thresholds);

  const data = {
    labels: ['Combined Attachment Rate'],
    datasets: [
      {
        data: [combinedRate],
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
              `Combined Rate: ${value.toFixed(2)}%`,
              `Status: ${performance.level}`,
              `Total Quantity: ${totalQuantity}`,
              `Target Quantity: ${deviceSupplierQuantity}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        min: 0,
        max: Math.max(200, combinedRate),
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
        <h3 className="text-sm font-medium text-gray-900">Attachment Rate Performance</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">&lt;150%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">150-170%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">&gt;170%</span>
          </div>
        </div>
      </div>
      <div className="h-12">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};