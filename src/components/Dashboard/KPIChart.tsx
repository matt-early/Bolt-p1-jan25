import React from 'react';
import { Bar } from 'react-chartjs-2';
import { SalesMetrics } from '../../types';

interface KPIChartProps {
  metrics: SalesMetrics[];
  deviceSupplierQuantity: number;
}

export const KPIChart: React.FC<KPIChartProps> = ({ metrics, deviceSupplierQuantity }) => {
  const thresholds = {
    low: 150,
    medium: 170,
  };

  const getPerformanceColor = (rate: number) => {
    if (rate < thresholds.low) return 'rgba(239, 68, 68, 0.7)'; // red
    if (rate < thresholds.medium) return 'rgba(234, 179, 8, 0.7)'; // yellow
    return 'rgba(34, 197, 94, 0.7)'; // green
  };

  // Calculate combined total quantity for suppliers 1-4
  const totalQuantity = metrics
    .filter(m => m.supplierId >= 1 && m.supplierId <= 4)
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const combinedRate = deviceSupplierQuantity > 0 
    ? Number((totalQuantity / deviceSupplierQuantity * 100).toFixed(2)) 
    : 0;
  const performanceColor = getPerformanceColor(combinedRate);

  const data = {
    labels: ['Combined Attachment Rate'],
    datasets: [
      {
        data: [combinedRate],
        backgroundColor: performanceColor,
        borderWidth: 1,
        borderColor: performanceColor.replace('0.7', '1'),
        barThickness: 40,
      }
    ]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            let performance = 'Below Target';
            if (value >= thresholds.medium) performance = 'Exceeding Target';
            else if (value >= thresholds.low) performance = 'Meeting Target';
            return [
              `Combined Rate: ${value.toFixed(2)}%`,
              `Status: ${performance}`,
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
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Combined Performance Against Targets</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">&lt;150%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">150-170%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">&gt;170%</span>
          </div>
        </div>
      </div>
      <Bar data={data} options={options} height={100} />
    </div>
  );
};