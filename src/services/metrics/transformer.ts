import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { SalesMetrics } from '../../types';
import { logOperation } from '../firebase/logging';
import { toNZDateTime } from '../../utils/dateUtils/timezone';

export const transformMetricsDoc = (doc: QueryDocumentSnapshot<DocumentData>): SalesMetrics | null => {
  try {
    const data = doc.data();
    
    // Validate required fields
    if (!data.supplierId || !data.date) {
      logOperation('transformMetricsDoc', 'warning', {
        docId: doc.id,
        message: 'Missing required fields'
      });
      return null;
    }
    
    // Handle date conversion
    let dateStr: string;
    const rawDate = data.date;
    
    try {
      dateStr = rawDate.toDate().toISOString();
    } catch (error) {
      logOperation('transformMetricsDoc', 'error', {
        docId: doc.id,
        error: 'Invalid date format',
        rawDate
      });
      return null;
    }

    // Transform and validate numeric fields
    const metrics: SalesMetrics = {
      id: doc.id,
      supplierId: Number(data.supplierId) || 0,
      quantity: Number(data.quantity) || 0,
      salesAmount: Number(data.salesAmount) || 0,
      marginAmount: Number(data.marginAmount) || 0,
      date: dateStr,
      branchNumber: String(data.branchNumber || ''),
      staffCode: String(data.staffCode || ''),
      regionId: String(data.regionId || '')
    };

    return metrics;
  } catch (error) {
    logOperation('transformMetricsDoc', 'error', {
      docId: doc.id,
      error
    });
    return null; // Return null for invalid documents
  }
};