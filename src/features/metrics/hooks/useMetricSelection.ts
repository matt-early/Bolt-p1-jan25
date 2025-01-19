import { useState, useCallback } from 'react';
import { SelectionCriteria, MetricType } from '../types';
import { validateSelection } from '../utils/validation';
import { useMetricStore } from '../stores/metricStore';

export const useMetricSelection = () => {
  const [selection, setSelection] = useState<SelectionCriteria>({
    regions: [],
    stores: [],
    dateRange: { type: 'mtd' },
    metrics: ['sales']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateSelection } = useMetricStore();

  const updateCriteria = useCallback((updates: Partial<SelectionCriteria>) => {
    const newSelection = { ...selection, ...updates };
    const validationErrors = validateSelection(newSelection);
    
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setSelection(newSelection);
      updateSelection(newSelection);
    }
  }, [selection, updateSelection]);

  const addMetric = useCallback((metric: MetricType) => {
    if (!selection.metrics.includes(metric)) {
      updateCriteria({ metrics: [...selection.metrics, metric] });
    }
  }, [selection.metrics, updateCriteria]);

  const removeMetric = useCallback((metric: MetricType) => {
    updateCriteria({
      metrics: selection.metrics.filter(m => m !== metric)
    });
  }, [selection.metrics, updateCriteria]);

  return {
    selection,
    errors,
    updateCriteria,
    addMetric,
    removeMetric
  };
};