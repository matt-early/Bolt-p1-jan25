import React, { useState, useEffect } from 'react';
import { fetchStoresByRegion } from '../../../services/stores';
import { fetchSalespeople } from '../../../services/salespeople';
import { fetchMetricsByStaff } from '../../../services/metrics';
import { Store, SalesMetrics } from '../../../types';
import { UserProfile } from '../../../types/auth';
import { DateRangeSelector } from '../../Dashboard/DateRangeSelector';
import { PerformanceMetrics } from '../../Dashboard/PerformanceMetrics';
import { SupplierPerformance } from '../../Dashboard/SupplierPerformance';
import { AttachmentRateChart } from '../../Dashboard/AttachmentRateChart';
import { suppliers } from '../../../data/suppliers';
import { DateRange, CURRENT_DATE } from '../../../utils/dateUtils';
import { SelectedPeriod } from '../../../utils/dateUtils/types';

export const SalespersonMetrics: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [salespeople, setSalespeople] = useState<UserProfile[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedSalesperson, setSelectedSalesperson] = useState<UserProfile | null>(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadSalespeople();
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (selectedSalesperson) {
      // Initialize selected store IDs with all stores when a salesperson is selected
      setSelectedStoreIds(selectedSalesperson.storeIds);
      loadMetrics();
    }
  }, [selectedSalesperson]);

  useEffect(() => {
    if (selectedSalesperson && selectedStoreIds.length > 0) {
      loadMetrics();
    }
  }, [selectedStoreIds]);

  const loadStores = async () => {
    try {
      const data = await fetchStoresByRegion('all');
      setStores(data);
      setSelectedStoreId('');
      setSelectedSalesperson(null);
      setSelectedStoreIds([]);
      setError(null);
    } catch (err) {
      setError('Failed to load stores');
      console.error('Error loading stores:', err);
    }
  };

  const loadSalespeople = async () => {
    try {
      const data = await fetchSalespeople();
      // Filter salespeople by selected store
      const filteredSalespeople = data.filter(sp => 
        sp.primaryStoreId === selectedStoreId || sp.storeIds.includes(selectedStoreId)
      );
      setSalespeople(filteredSalespeople);
      setSelectedSalesperson(null);
      setSelectedStoreIds([]);
      setError(null);
    } catch (err) {
      setError('Failed to load team members');
      console.error('Error loading team members:', err);
    }
  };

  const loadMetrics = async () => {
    if (!selectedSalesperson || selectedStoreIds.length === 0) {
      setMetrics([]);
      return;
    }

    try {
      setLoading(true);
      const branchNumbers = selectedStoreIds
        .map(id => stores.find(s => s.id === id)?.branchNumber)
        .filter((branchNumber): branchNumber is string => branchNumber !== undefined);

      console.log('Fetching metrics for:', {
        staffCode: selectedSalesperson.staffCode,
        branchNumbers
      });

      const data = await fetchMetricsByStaff(
        selectedSalesperson.staffCode,
        branchNumbers
      );
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load metrics data');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSalespersonChange = (salespersonId: string) => {
    const salesperson = salespeople.find(sp => sp.id === salespersonId);
    setSelectedSalesperson(salesperson || null);
  };

  const handleStoreToggle = (storeId: string) => {
    setSelectedStoreIds(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? `${store.name} (Branch ${store.branchNumber})` : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Team Member Metrics</h2>
        <div className="flex gap-4">
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!stores.length}
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} (Branch {store.branchNumber})
              </option>
            ))}
          </select>

          <select
            value={selectedSalesperson?.id || ''}
            onChange={(e) => handleSalespersonChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!salespeople.length}
          >
            <option value="">Select Team Member</option>
            {salespeople.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name} ({sp.staffCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSalesperson && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Store Selection</h3>
          <div className="space-y-2">
            {selectedSalesperson.storeIds.map(storeId => {
              const isPrimaryStore = storeId === selectedSalesperson.primaryStoreId;
              return (
                <label key={storeId} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStoreIds.includes(storeId)}
                    onChange={() => handleStoreToggle(storeId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {getStoreName(storeId)}
                    {isPrimaryStore && (
                      <span className="ml-2 text-xs text-blue-600">(Primary Store)</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {selectedSalesperson && (
        <>
          <DateRangeSelector
            selectedRange={dateRange}
            onRangeChange={setDateRange}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-600">Loading metrics...</div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </>
      )}
    </div>
  );
};