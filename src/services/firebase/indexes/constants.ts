import { FirebaseIndex } from './types';

export const REQUIRED_INDEXES: FirebaseIndex[] = [
  {
    id: 'auth-requests-status-date',
    collection: 'authRequests',
    fields: [
      { fieldPath: 'status', mode: 'ASCENDING' },
      { fieldPath: 'requestedAt', mode: 'DESCENDING' }
    ]
  },
  {
    id: 'metrics-region-date',
    collection: 'metrics',
    fields: [
      { fieldPath: 'regionId', mode: 'ASCENDING' },
      { fieldPath: 'date', mode: 'DESCENDING' }
    ]
  }
];