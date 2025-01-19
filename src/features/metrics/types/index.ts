// Core metric types
export type MetricType = 'sales' | 'traffic' | 'conversion' | 'attachment';

export interface MetricDefinition {
  id: MetricType;
  label: string;
  description: string;
  format: 'currency' | 'percentage' | 'number';
  aggregation: 'sum' | 'average' | 'count';
}

// Selection types
export interface SelectionCriteria {
  regions: string[];
  stores: string[];
  dateRange: DateRange;
  metrics: MetricType[];
  comparison?: ComparisonCriteria;
}

export interface ComparisonCriteria {
  type: 'period' | 'selection';
  offset?: number; // For period comparisons (e.g., -1 for previous period)
  reference?: SelectionCriteria; // For selection comparisons
}

// Result types
export interface MetricResult {
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  metadata?: Record<string, any>;
}

export interface AggregatedResults {
  primary: Record<MetricType, MetricResult>;
  comparison?: Record<MetricType, MetricResult>;
  segments?: Record<string, Record<MetricType, MetricResult>>;
}