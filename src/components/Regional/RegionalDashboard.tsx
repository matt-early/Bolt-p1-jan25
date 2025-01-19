import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Region } from '../../types';
import { fetchStoresByRegion } from '../../services/stores';
import { fetchRegions } from '../../services/regions';
import { DateRangeSelector } from '../Dashboard/DateRangeSelector';
import { PerformanceMetrics } from '../Dashboard/PerformanceMetrics';
import { SupplierPerformance } from '../Dashboard/SupplierPerformance';
import { AttachmentRateChart } from '../Dashboard/AttachmentRateChart';
import { StorePerformanceTable } from './StorePerformanceTable';
import { DateRange } from '../../utils/dateUtils';

export const RegionalDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('mtd');
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth(),
    quarter: Math.floor(new Date().getMonth() / 3),
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.regionId) return;

      try {
        setLoading(true);
        const [storesData, regionsData] = await Promise.all([
          fetchStoresByRegion(userProfile.regionId),
          fetchRegions()
        ]);

        setStores(storesData);
        setRegion(regionsData.find(r => r.id === userProfile.regionId) || null);
        setError(null);
      } catch (err) {
        setError('Failed to load regional data');
        console.error('Error loading regional data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading regional dashboard...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">
          {region?.name || 'Regional'} Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Managing {stores.length} store{stores.length !== 1 ? 's' : ''}
        </p>
      </div>

      <DateRangeSelector
        selectedRange={dateRange}
        onRangeChange={setDateRange}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <PerformanceMetrics
        metrics={[]} // TODO: Add metrics data
        dateRange={dateRange}
        selectedPeriod={selectedPeriod}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SupplierPerformance
            metrics={[]} // TODO: Add metrics data
            suppliers={[]} // TODO: Add suppliers data
            dateRange={dateRange}
            selectedPeriod={selectedPeriod}
          />
        </div>
        <div>
          <AttachmentRateChart
            metrics={[]} // TODO: Add metrics data
            dateRange={dateRange}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>

      <StorePerformanceTable stores={stores} />
    </div>
  );
};