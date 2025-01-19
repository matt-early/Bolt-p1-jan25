import React from 'react';
import { SelectionCriteria } from '../../types';
import { RegionSelect } from './RegionSelect';
import { StoreSelect } from './StoreSelect';
import { DateRangeSelect } from './DateRangeSelect';
import { MetricSelect } from './MetricSelect';
import { ComparisonSelect } from './ComparisonSelect';

interface SelectionPanelProps {
  selection: SelectionCriteria;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<SelectionCriteria>) => void;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selection,
  errors,
  onUpdate
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Data Selection</h2>

      <RegionSelect
        selected={selection.regions}
        error={errors.regions}
        onChange={(regions) => onUpdate({ regions })}
      />

      <StoreSelect
        selected={selection.stores}
        regions={selection.regions}
        error={errors.stores}
        onChange={(stores) => onUpdate({ stores })}
      />

      <DateRangeSelect
        selected={selection.dateRange}
        error={errors.dateRange}
        onChange={(dateRange) => onUpdate({ dateRange })}
      />

      <MetricSelect
        selected={selection.metrics}
        error={errors.metrics}
        onChange={(metrics) => onUpdate({ metrics })}
      />

      <ComparisonSelect
        selected={selection.comparison}
        error={errors.comparison}
        onChange={(comparison) => onUpdate({ comparison })}
      />
    </div>
  );
};