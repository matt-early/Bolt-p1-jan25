import { MetricDefinition } from '../types';

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  sales: {
    id: 'sales',
    label: 'Sales',
    description: 'Total sales amount',
    format: 'currency',
    aggregation: 'sum'
  },
  traffic: {
    id: 'traffic',
    label: 'Traffic',
    description: 'Store visitor count',
    format: 'number',
    aggregation: 'sum'
  },
  conversion: {
    id: 'conversion',
    label: 'Conversion Rate',
    description: 'Percentage of visitors who made a purchase',
    format: 'percentage',
    aggregation: 'average'
  },
  attachment: {
    id: 'attachment',
    label: 'Attachment Rate',
    description: 'Average number of additional items per sale',
    format: 'number',
    aggregation: 'average'
  }
};

export const DEFAULT_METRICS = ['sales', 'conversion'];