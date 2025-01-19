import { collection, query, where, orderBy } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { Store } from '../../types';

export const STORES_COLLECTION = 'stores';

export const getStoresCollection = async () => {
  const db = await getDb();
  return collection(db, STORES_COLLECTION);
};

export const createStoreQuery = async (regionId?: string) => {
  const storesCollection = await getStoresCollection();
  
  if (!regionId || regionId === 'all') {
    return query(storesCollection, orderBy('branchNumber'));
  }
  
  return query(
    storesCollection,
    where('regionId', '==', regionId),
    orderBy('branchNumber')
  );
};