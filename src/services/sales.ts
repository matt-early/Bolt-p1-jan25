import { 
  collection,
  writeBatch,
  doc,
  Timestamp
} from 'firebase/firestore';
import { getDb } from './firebase/db';
import { SalesDataRow } from '../types/import';
import { logOperation } from './firebase/logging';
import { createNZTimestamp } from '../utils/dateUtils/timezone';
import { COLLECTION_NAMES } from './firebase/collections';

export const importSalesData = async (
  data: SalesDataRow[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const db = await getDb();
    const batch = writeBatch(db);
    const metricsRef = collection(db, COLLECTION_NAMES.METRICS);
    let processedRows = 0;

    for (const row of data) {
      // Create metrics entries for each supplier
      const suppliers = [
        {
          id: 1,
          quantity: row.cellnetQuantity,
          salesAmount: row.cellnetSales,
          marginAmount: row.cellnetMargin
        },
        {
          id: 2,
          quantity: row.likewizeAccQuantity,
          salesAmount: row.likewizeAccSales,
          marginAmount: row.likewizeAccMargin
        },
        {
          id: 3,
          quantity: row.pacificommQuantity,
          salesAmount: row.pacificommSales,
          marginAmount: row.pacificommMargin
        },
        {
          id: 4,
          quantity: row.studiotechQuantity,
          salesAmount: row.studiotechSales,
          marginAmount: row.studiotechMargin
        },
        {
          id: 5,
          quantity: row.likewizeDeviceQuantity,
          salesAmount: 0,
          marginAmount: 0
        }
      ];

      for (const supplier of suppliers) {
        const docRef = doc(metricsRef);
        batch.set(docRef, {
          date: createNZTimestamp(row.date),
          branchNumber: row.branchNumber,
          staffCode: row.staffCode,
          supplierId: supplier.id,
          quantity: supplier.quantity,
          salesAmount: supplier.salesAmount,
          marginAmount: supplier.marginAmount,
          createdAt: Timestamp.now()
        });
      }

      processedRows++;
      if (onProgress) {
        onProgress(processedRows / data.length);
      }
    }

    await batch.commit();
    logOperation('importSalesData', 'success', { rowsProcessed: data.length });
  } catch (error) {
    logOperation('importSalesData', 'error', error);
    throw error;
  }
};