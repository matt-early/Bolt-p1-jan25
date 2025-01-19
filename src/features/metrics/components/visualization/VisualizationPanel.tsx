import React, { useState } from 'react';
import { SelectionCriteria, AggregatedResults } from '../../types';
import { MetricSummary } from './MetricSummary';
import { TrendChart } from './TrendChart';
import { ComparisonChart } from './ComparisonChart';
import { DetailTable } from './DetailTable';
import { ViewSelector } from './ViewSelector';

interface VisualizationPanelProps {
  loading: boolean;
  error: string | null;
  results: AggregatedResults | null;
  selection: SelectionCriteria;
}

type ViewType = 'summary' | 'trends' | 'comparison' | 'details';

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  loading,
  error,
  results,
  selection
}) => {
  const [activeView, setActiveView] = useState<ViewType>('summary');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading metrics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500">No data available for the selected criteria</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <ViewSelector active={activeView} onChange={setActiveView} />
      </div>

      <div className="p-6">
        {activeView === 'summary' && (
          <MetricSummary results={results} selection={selection} />
        )}
        {activeView === 'trends' && (
          <TrendChart results={results} selection={selection} />
        )}
        {activeView === 'comparison' && (
          <ComparisonChart results={results} selection={selection} />
        )}
        {activeView === 'details' && (
          <DetailTable results={results} selection={selection} />
        )}
      </div>
    </div>
  );
};