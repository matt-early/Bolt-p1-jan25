import { useMemo } from 'react';
import { SelectionCriteria, AggregatedResults } from '../types';
import { createCache } from '../utils/cache';

const CACHE_SIZE = 50; // Maximum number of cached results
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useMetricCache = () => {
  const cache = useMemo(() => createCache<AggregatedResults>(CACHE_SIZE, CACHE_TTL), []);

  const getCachedData = (selection: SelectionCriteria): AggregatedResults | null => {
    const key = JSON.stringify(selection);
    return cache.get(key);
  };

  const setCachedData = (selection: SelectionCriteria, data: AggregatedResults): void => {
    const key = JSON.stringify(selection);
    cache.set(key, data);
  };

  return { getCachedData, setCachedData };
};