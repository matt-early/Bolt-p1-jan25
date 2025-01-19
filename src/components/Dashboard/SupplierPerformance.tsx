import React from 'react';
import { SalesMetrics, Supplier } from '../../types';
import { DateRange, filterMetricsByDateRange } from '../../utils/dateUtils';
import { calculateAverages } from '../../utils/calculationUtils';
import { getSupplierName, isDeviceSupplier } from '../../data/suppliers';
import { KPIMetrics } from './KPIMetrics';

interface SupplierPerformanceProps {
  metrics: SalesMetrics[];
  suppliers: Supplier[];
  dateRange: DateRange;
  customRange?: DateSelection;
  selectedPeriod?: {
    month?: number;
    quarter?: number;
    year: number;
  };
}

export const SupplierPerformance: React.FC<SupplierPerformanceProps> = ({
  metrics,
  suppliers,
  dateRange,
  customRange,
  selectedPeriod
}) => {
  const filteredMetrics = filterMetricsByDateRange(metrics, dateRange, customRange, selectedPeriod);
  const showAverages = dateRange !== 'daily';
  const showKPIChart = ['daily', 'mtd', 'monthly'].includes(dateRange);

  const deviceSupplierQuantity = filteredMetrics
    .filter(m => m.supplierId === 5)
    .reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Supplier Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              {showAverages && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Daily Sales
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin
              </th>
              {showAverages && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Daily Margin
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => {
              const supplierMetrics = filteredMetrics.filter(m => m.supplierId === supplier.id);
              const totalQty = supplierMetrics.reduce((sum, m) => sum + m.quantity, 0);
              const totalSales = supplierMetrics.reduce((sum, m) => sum + m.salesAmount, 0);
              const totalMargin = supplierMetrics.reduce((sum, m) => sum + m.marginAmount, 0);
              const averages = calculateAverages(supplierMetrics, dateRange);

              return (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getSupplierName(supplier.id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{totalQty}</div>
                  </td>
                  {!isDeviceSupplier(supplier.id) ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${totalSales.toLocaleString()}</div>
                      </td>
                      {showAverages && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${averages ? averages.avgSales.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${totalMargin.toLocaleString()}</div>
                      </td>
                      {showAverages && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${averages ? averages.avgMargin.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
                          </div>
                        </td>
                      )}
                    </>
                  ) : (
                    <td colSpan={showAverages ? 4 : 2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                      Quantity Only
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showKPIChart && (
        <KPIMetrics 
          metrics={filteredMetrics}
          deviceSupplierQuantity={deviceSupplierQuantity}
          dateRange={dateRange}
        />
      )}
    </div>
  );
};