import React from 'react';
import { SelectionPanel } from './selection/SelectionPanel';
import { VisualizationPanel } from './visualization/VisualizationPanel';
import { useMetricSelection } from '../hooks/useMetricSelection';
import { useMetricData } from '../hooks/useMetricData';

export const MetricDashboard: React.FC = () => {
  const { selection, errors, updateCriteria } = useMetricSelection();
  const { loading, error, results } = useMetricData(selection);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Selection Panel */}
          <div className="col-span-12 lg:col-span-3">
            <SelectionPanel
              selection={selection}
              errors={errors}
              onUpdate={updateCriteria}
            />
          </div>

          {/* Visualization Panel */}
          <div className="col-span-12 lg:col-span-9">
            <VisualizationPanel
              loading={loading}
              error={error}
              results={results}
              selection={selection}
            />
          </div>
        </div>
      </div>
    </div>
  );
};