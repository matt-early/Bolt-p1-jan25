import { useState, useEffect } from 'react';
import { SelectionCriteria, AggregatedResults } from '../types';
import { fetchMetricData } from '../services/metricService';
import { useMetricCache } from './useMetricCache';
import { processMetricData } from '../utils/processing';
import { reinitializeFirestore } from '../services/firebase/initialization';
import { useRetry } from './useRetry';

export const useMetricData = (selection: SelectionCriteria) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AggregatedResults | null>(null);
  
  const { getCachedData, setCachedData } = useMetricCache();
  const { retry, canRetry } = useRetry({ maxAttempts: 3 });

  const loadData = async (withRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      if (withRetry) {
        await reinitializeFirestore();
      }

      // Check cache first
      const cachedData = getCachedData(selection);
      if (cachedData) {
        setResults(cachedData);
        return;
      }

      // Fetch and process data
      const rawData = await fetchMetricData(selection);
      const processedResults = processMetricData(rawData, selection);
      
      // Update cache and state
      setCachedData(selection, processedResults);
      setResults(processedResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load metric data';
      setError(message);
      
      if (message.includes('indexes are being created') && canRetry) {
        // Wait 5 seconds before retrying for indexes
        setTimeout(() => loadData(true), 5000);
      }
      
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selection]);

  return { 
    loading, 
    error, 
    results,
    retry: () => loadData(true)
  };
};