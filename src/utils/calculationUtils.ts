import { SalesMetrics, DateRange } from '../types';

export const calculateAverages = (metrics: SalesMetrics[], dateRange: DateRange) => {
  if (dateRange === 'daily') return null;

  const totalDays = new Set(metrics.map(m => m.date.split('T')[0])).size;
  
  if (totalDays === 0) return null;

  const totals = metrics.reduce((acc, metric) => ({
    salesAmount: acc.salesAmount + metric.salesAmount,
    marginAmount: acc.marginAmount + metric.marginAmount,
  }), { salesAmount: 0, marginAmount: 0 });

  return {
    avgSales: totals.salesAmount / totalDays,
    avgMargin: totals.marginAmount / totalDays,
  };
};

export const calculateAverageSalesPerUnit = (metrics: SalesMetrics[]): number => {
  const nonDeviceMetrics = metrics.filter(m => m.supplierId >= 1 && m.supplierId <= 4);
  const totalQuantity = nonDeviceMetrics.reduce((sum, metric) => sum + metric.quantity, 0);
  const totalSales = nonDeviceMetrics.reduce((sum, metric) => sum + metric.salesAmount, 0);
  
  if (totalQuantity === 0) return 0;
  
  return Number((totalSales / totalQuantity).toFixed(2));
};