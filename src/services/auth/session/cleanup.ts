import { User } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';

interface CleanupHandlers {
  [key: string]: (() => void)[];
}

const cleanupHandlers: CleanupHandlers = {};

export const registerCleanup = (userId: string, cleanup: () => void): void => {
  if (!cleanupHandlers[userId]) {
    cleanupHandlers[userId] = [];
  }
  cleanupHandlers[userId].push(cleanup);
};

export const runCleanup = (userId: string): void => {
  try {
    const handlers = cleanupHandlers[userId] || [];
    handlers.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        logOperation('runCleanup.handler', 'error', error);
      }
    });
    delete cleanupHandlers[userId];
  } catch (error) {
    logOperation('runCleanup', 'error', error);
  }
};

export const setupAuthCleanup = (user: User | null): () => void => {
  if (!user) return () => {};

  const cleanup = () => {
    runCleanup(user.uid);
  };

  registerCleanup(user.uid, cleanup);
  return cleanup;
};