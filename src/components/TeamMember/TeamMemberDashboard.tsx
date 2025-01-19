import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DateRangeSelector } from '../Dashboard/DateRangeSelector';
import { PerformanceMetrics } from '../Dashboard/PerformanceMetrics';
import { SupplierPerformance } from '../Dashboard/SupplierPerformance';
import { AttachmentRateChart } from '../Dashboard/AttachmentRateChart';
import { fetchMetricsByStaff } from '../../services/metrics';
import { DateRange } from '../../utils/dateUtils';
import { SalesMetrics, Store, DateSelection } from '../../types';
import { suppliers } from '../../data/suppliers';
import { fetchStores } from '../../services/stores';
import { StoreSelector } from './StoreSelector';

export const TeamMemberDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState<SalesMetrics[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('mtd');
  const [customRange, setCustomRange] = useState<DateSelection>({
    startDate: new Date(),
    endDate: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth(),
    quarter: Math.floor(new Date().getMonth() / 3),
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stores on mount
  useEffect(() => {
    const loadStores = async () => {
      if (!userProfile?.storeIds) return;
      
      try {
        const allStores = await fetchStores();
        // Filter to only user's assigned stores
        const userStores = allStores.filter(store => 
          userProfile.storeIds?.includes(store.id)
        );
        setStores(userStores);
      } catch (err) {
        console.error('Error loading stores:', err);
        setError('Failed to load store information');
      }
    };

    loadStores();
  }, [userProfile?.storeIds]);

  // Load metrics when store selection changes
  useEffect(() => {
    const loadMetrics = async () => {
      if (!userProfile?.staffCode || !userProfile?.storeIds) return;

      try {
        setLoading(true);
        // If store is selected, only get metrics for that store
        const storeIds = selectedStoreId ? [selectedStoreId] : userProfile.storeIds;
        const data = await fetchMetricsByStaff(userProfile.staffCode, storeIds);
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load metrics data');
        console.error('Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [userProfile, selectedStoreId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
            <p className="text-gray-500 mt-1">
              Viewing metrics for {userProfile?.name}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <StoreSelector
              stores={stores}
              selectedStoreId={selectedStoreId}
              onStoreSelect={setSelectedStoreId}
              primaryStoreId={userProfile?.primaryStoreId}
            />
          </div>
        </div>
      </div>

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
        selectedPeriod={selectedPeriod}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SupplierPerformance
            metrics={metrics}
            suppliers={suppliers}
            dateRange={dateRange}
            selectedPeriod={selectedPeriod}
          />
        </div>
        <div>
          <AttachmentRateChart
            metrics={metrics}
            dateRange={dateRange}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
    </div>
  );
};