import { logOperation } from '../logging';
import { checkIndex } from './checker';
import { REQUIRED_INDEXES } from './constants';
import { delay, retry } from '../utils';

let indexesInitialized = false;
let initializationPromise: Promise<void> | null = null;

const MAX_ATTEMPTS = 3;
const BASE_DELAY = 1000;

export const initializeIndexes = async () => {
  // Return existing promise if initialization is in progress
  if (initializationPromise) return initializationPromise;
  if (indexesInitialized) return Promise.resolve();

  initializationPromise = (async () => {
    try {
      logOperation('initializeIndexes', 'start');

      // Check each index but don't fail if they're not ready
      const results = await Promise.allSettled(
        REQUIRED_INDEXES.map(async index => {
          try {
            return await retry(
              async () => checkIndex(index),
              MAX_ATTEMPTS,
              BASE_DELAY
            );
          } catch (error: any) {
            // Handle permission denied gracefully
            if (error.code === 'permission-denied') {
              logOperation('initializeIndexes', 'warning', {
                message: 'Permission denied checking index',
                index: index.id
              });
              return false;
            }
            throw error;
          }
        })
      );

      // Log results but don't fail initialization
      results.forEach((result, i) => {
        const index = REQUIRED_INDEXES[i];
        if (result.status === 'rejected') {
          logOperation('initializeIndexes', 'warning', {
            index: index.id,
            error: result.reason
          });
        } else if (!result.value) {
          logOperation('initializeIndexes', 'warning', 
            `Index ${index.id} not ready - queries may be limited`);
        }
      });

      indexesInitialized = true;
      logOperation('initializeIndexes', 'complete');
    } catch (error) {
      logOperation('initializeIndexes', 'error', error);
      // Continue with limited functionality
      indexesInitialized = true;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

export const waitForIndexes = async () => {
  // Don't block on index initialization
  initializeIndexes().catch(() => {
    // Log error but continue
    logOperation('waitForIndexes', 'warning', 
      'Failed to initialize indexes - some queries may be limited');
  });
  return Promise.resolve();
};