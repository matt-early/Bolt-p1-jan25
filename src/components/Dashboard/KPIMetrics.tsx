import React from 'react';
import { SalesMetrics, DateRange } from '../../types';
import { AttachmentRateKPI } from './KPIs/AttachmentRateKPI';
import { AverageSalesKPI } from './KPIs/AverageSalesKPI';
import { PacificommShareKPI } from './KPIs/PacificommShareKPI';

interface KPIMetricsProps {
  metrics: SalesMetrics[];
  deviceSupplierQuantity: number;
  dateRange: DateRange;
}

export const KPIMetrics: React.FC<KPIMetricsProps> = ({
  metrics,
  deviceSupplierQuantity,
  dateRange,
}) => {
  const showAverageSales = ['mtd', 'monthly'].includes(dateRange);

  return (
    <div className="space-y-4 mt-6">
      <AttachmentRateKPI 
        metrics={metrics}
        deviceSupplierQuantity={deviceSupplierQuantity}
      />
      {showAverageSales && (
        <AverageSalesKPI 
          metrics={metrics}
          dateRange={dateRange}
        />
      )}
      <PacificommShareKPI metrics={metrics} />
    </div>
  );
};