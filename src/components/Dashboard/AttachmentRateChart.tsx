import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SalesMetrics, DateSelection } from '../../types';
import { DateRange, filterMetricsByDateRange } from '../../utils/dateUtils';
import { getSupplierName, getSupplierColor } from '../../data/suppliers';
import { formatPercentage, formatNumber } from '../../utils/formatting/index';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CHART_HEIGHT = 300; // Fixed height for better visualization

interface AttachmentRateChartProps {
  metrics: SalesMetrics[];
  dateRange: DateRange;
  customRange?: DateSelection;
  selectedPeriod?: {
    month?: number;
    quarter?: number;
    year: number;
  };
}

export const AttachmentRateChart: React.FC<AttachmentRateChartProps> = ({
  metrics,
  dateRange,
  customRange,
  selectedPeriod
}) => {
  const filteredMetrics = filterMetricsByDateRange(metrics, dateRange, customRange, selectedPeriod);
  
  // Get Likewize Device quantity (baseline)
  const deviceSupplierQuantity = filteredMetrics
    .filter(m => m.supplierId === 5)
    .reduce((sum, m) => sum + m.quantity, 0);

  // Calculate individual attachment rates for suppliers 1-4
  const attachmentRates = [1, 2, 3, 4].map(supplierId => {
    const supplierQuantity = filteredMetrics
      .filter(m => m.supplierId === supplierId)
      .reduce((sum, m) => sum + m.quantity, 0);
    
    return {
      supplierId,
      quantity: supplierQuantity,
      rate: deviceSupplierQuantity > 0 ? Number((supplierQuantity / deviceSupplierQuantity * 100).toFixed(2)) : 0
    };
  });

  // Calculate combined attachment rate
  const totalQuantitySuppliers = attachmentRates.reduce((sum, supplier) => sum + supplier.quantity, 0);
  const combinedAttachmentRate = deviceSupplierQuantity > 0 
    ? Number((totalQuantitySuppliers / deviceSupplierQuantity * 100).toFixed(2)) 
    : 0;

  const chartData = {
    labels: [...attachmentRates.map(s => getSupplierName(s.supplierId)), 'Combined Rate'],
    datasets: [
      {
        label: 'Attachment Rate (%)',
        data: [...attachmentRates.map(s => s.rate), combinedAttachmentRate],
        backgroundColor: (context: any) => {
          if (context.dataIndex === attachmentRates.length) {
            return 'rgba(34, 197, 94, 0.7)'; // Green for combined total
          }
          const supplier = attachmentRates[context.dataIndex];
          return getSupplierColor(supplier.supplierId);
        },
        borderColor: (context: any) => {
          if (context.dataIndex === attachmentRates.length) {
            return 'rgb(34, 197, 94)'; // Green for combined total
          }
          const supplier = attachmentRates[context.dataIndex];
          return getSupplierColor(supplier.supplierId).replace('0.7', '1');
        },
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Attachment Rates to ${getSupplierName(5)}`,
        padding: 20,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const value = context.raw as number;
            const lines = [];

            if (index === attachmentRates.length) {
              lines.push(`Combined Rate: ${formatPercentage(value / 100)}`);
              lines.push(`Total Quantity: ${formatNumber(totalQuantitySuppliers)}`);
              lines.push(`${getSupplierName(5)}: ${formatNumber(deviceSupplierQuantity)}`);
            } else {
              const supplier = attachmentRates[index];
              lines.push(`${supplier.name}: ${formatPercentage(value / 100)}`);
              lines.push(`Quantity: ${formatNumber(supplier.quantity)}`);
              lines.push(`${getSupplierName(5)}: ${formatNumber(deviceSupplierQuantity)}`);
            }
            return lines;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(200, Math.ceil(Math.max(...attachmentRates.map(s => s.rate), combinedAttachmentRate) / 10) * 10),
        title: {
          display: true,
          text: 'Attachment Rate (%)',
          font: {
            weight: 'bold',
          },
          padding: { bottom: 10 },
        },
        ticks: {
          callback: (value) => `${value}%`,
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold',
          },
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div style={{ height: CHART_HEIGHT }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="flex justify-center items-center text-sm text-gray-500">
        <span className="font-medium">Device Quantity: </span>
        <span className="ml-2">{formatNumber(deviceSupplierQuantity)}</span>
      </div>
    </div>
  );
};