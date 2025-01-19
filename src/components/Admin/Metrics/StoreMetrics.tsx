import React, { useState, useEffect } from 'react';
import { fetchStoresByRegion } from '../../../services/stores';
import { fetchMetricsByStore } from '../../../services/metrics';
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
import { StoreSelector } from './components/StoreSelector';

export const StoreMetrics: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
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
    loadMetrics();
  }, [selectedStoreId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load data in parallel
      const [storesData, regionsData] = await Promise.all([
        fetchStoresByRegion('all'),
        fetchRegions()
      ]);

      setStores(storesData);
      setRegions(regionsData);
      await loadMetrics();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedStoreId === 'all') {
        const data = await fetchMetricsByStore([]);
        setMetrics(data);
      } else {
        const store = stores.find(s => s.id === selectedStoreId);
        if (store) {
          const data = await fetchMetricsByStore([store.branchNumber]);
          setMetrics(data);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(message);
      console.error('Error loading metrics:', err);
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
        <h2 className="text-2xl font-bold text-gray-900">Store Metrics</h2>
        <StoreSelector
          stores={stores}
          regions={regions}
          selectedStoreId={selectedStoreId}
          onStoreSelect={setSelectedStoreId}
        />
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