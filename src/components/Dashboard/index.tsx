import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserMetrics } from '../../services/firestore';
import { Header } from '../Layout/Header';
import { DateRangeSelector } from './DateRangeSelector';
import { PerformanceMetrics } from './PerformanceMetrics';
import { SupplierPerformance } from './SupplierPerformance';
import { AttachmentRateChart } from './AttachmentRateChart';
import { RankingCard } from './RankingCard';
import { DateRange } from '../../utils/dateUtils';
import { DateSelection, SalesMetrics } from '../../types';
import { suppliers } from '../../data/suppliers';
import { mockRankings } from '../../data/mockData';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customRange, setCustomRange] = useState<DateSelection>({
    startDate: null,
    endDate: null
  });
  const [metrics, setMetrics] = useState<SalesMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Fetch last 30 days by default
        const endDate = new Date();
        
        const data = await fetchUserMetrics(currentUser.uid, startDate, endDate);
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        salesPersonName={currentUser?.email || 'Unknown User'}
        storeName="Downtown Store"
        regionName="Western Region"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DateRangeSelector
          selectedRange={dateRange}
          onRangeChange={setDateRange}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
        <PerformanceMetrics 
          metrics={metrics}
          dateRange={dateRange}
          customRange={customRange}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <SupplierPerformance 
              metrics={metrics}
              suppliers={suppliers}
              dateRange={dateRange}
              customRange={customRange}
            />
          </div>
          <div>
            <RankingCard rankings={mockRankings} />
          </div>
        </div>
        <div className="mt-6">
          <AttachmentRateChart
            metrics={metrics}
            dateRange={dateRange}
            customRange={customRange}
          />
        </div>
      </main>
    </div>
  );
};