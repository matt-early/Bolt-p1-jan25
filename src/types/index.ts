export interface Supplier {
  id: number;
  name: string;
}

export interface SalesMetrics {
  id: string;
  supplierId: number;
  quantity: number;
  salesAmount: number;
  marginAmount: number;
  date: string;
  branchNumber: string;
  staffCode: string;
  regionId?: string;
}

export interface Store {
  id: string;
  name: string;
  branchNumber: string;
  regionId: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Rankings {
  storeRank: number;
  regionRank: number;
  totalParticipants: number;
}

export interface DateSelection {
  startDate: Date | null;
  endDate: Date | null;
}

export interface KPIThresholds {
  low: number;
  medium: number;
  high: number;
}

export interface PerformanceLevel {
  rate: number;
  level: 'below' | 'meeting' | 'exceeding';
  color: string;
}

export interface RankingDetails {
  id: string;
  name: string;
  rank: number;
  attachmentRate: number;
  avgSalesPerUnit: number;
}