import { SalesMetrics, Rankings, RankingDetails } from '../types';
import { suppliers } from './suppliers';

const generateDailySalesAmount = (): number => {
  return Math.floor(Math.random() * (89 - 25 + 1)) + 25;
};

export const generateMockMetrics = (): SalesMetrics[] => {
  const metrics: SalesMetrics[] = [];
  const today = new Date(2023, 11, 9);
  
  for (let i = 0; i < 9; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    suppliers.forEach(supplier => {
      const dailySales = generateDailySalesAmount();
      const marginPercent = Math.random() * (0.30 - 0.20) + 0.20;
      
      metrics.push({
        supplierId: supplier.id,
        quantity: supplier.id === 5 ? 90 : Math.floor(Math.random() * 100),
        salesAmount: supplier.id !== 5 ? dailySales : 0,
        marginAmount: supplier.id !== 5 ? Math.floor(dailySales * marginPercent) : 0,
        date: date.toISOString()
      });
    });
  }
  
  return metrics;
};

export const mockRankings: Rankings = {
  storeRank: 3,
  regionRank: 12,
  totalParticipants: 50
};

export const generateMockSalespeople = (): RankingDetails[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `sp-${i + 1}`,
    name: `Salesperson ${i + 1}`,
    rank: i + 1,
    attachmentRate: Math.floor(Math.random() * (200 - 100) + 100),
    avgSalesPerUnit: Math.floor(Math.random() * (80 - 30) + 30)
  }));
};

export const generateMockStores = (): RankingDetails[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `st-${i + 1}`,
    name: `Store ${i + 1}`,
    rank: i + 1,
    attachmentRate: Math.floor(Math.random() * (200 - 100) + 100),
    avgSalesPerUnit: Math.floor(Math.random() * (80 - 30) + 30)
  }));
};