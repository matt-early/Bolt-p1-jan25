import React, { useState, useEffect } from 'react';
import { fetchStoresByRegion } from '../../../services/stores';
import { fetchMetricsByRegion } from '../../../services/metrics';
import { Store, SalesMetrics, Region } from '../../../types';
import { fetchRegions } from '../../../services/regions';
import { DateRangeSelector } from '../../Dashboard/DateRangeSelector';
import { PerformanceMetrics } from '../../Dashboard/PerformanceMetrics';
import { SupplierPerformance } from '../../Dashboard/SupplierPerformance';
import { AttachmentRateChart } from '../../Dashboard/AttachmentRateChart';
import { suppliers } from '../../../data/suppliers';
import { DateRange } from '../../../utils/dateUtils';
import { CURRENT_DATE } from '../../../utils/dateUtils/constants';
import { SelectedPeriod } from '../../../utils/dateUtils/types';

export const RegionMetrics: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const [metrics, setMetrics] = useState<SalesMetrics[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('mtd');
  const [customRange, setCustomRange] = useState({
    startDate: null,
    endDate: null
  });
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>({
    month: CURRENT_DATE.getMonth(),
    quarter: Math.floor(CURRENT_DATE.getMonth() / 3),
    year: CURRENT_DATE.getFullYear()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedRegionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load data in parallel
      const [storesData, metricsData, regionsData] = await Promise.all([
        fetchStoresByRegion(selectedRegionId),
        fetchMetricsByRegion(selectedRegionId),
        fetchRegions()
      ]);

      setStores(storesData);
      setMetrics(metricsData);
      setRegions(regionsData);
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : 'Failed to load metrics data. Please try again.';
      setError(message);
      console.error('Error loading data:', err);
      
      // Clear data on error
      setMetrics([]);
      setStores([]);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Region Metrics</h2>
        <select
          value={selectedRegionId}
          onChange={(e) => setSelectedRegionId(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option 
              key={region.id} 
              value={region.id}
            >
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <DateRangeSelector
        selectedRange={dateRange}
        onRangeChange={setDateRange}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <PerformanceMetrics
        metrics={metrics}
        dateRange={dateRange}
        customRange={customRange}
        selectedPeriod={selectedPeriod}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SupplierPerformance
            metrics={metrics}
            suppliers={suppliers}
            dateRange={dateRange}
            customRange={customRange}
            selectedPeriod={selectedPeriod}
          />
        </div>
        <div>
          <AttachmentRateChart
            metrics={metrics}
            dateRange={dateRange}
            customRange={customRange}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
    </div>
  );
};