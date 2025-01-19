import { LRUCache } from 'lru-cache';

// Create index status cache
export const indexCache = new LRUCache<string, boolean>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
});