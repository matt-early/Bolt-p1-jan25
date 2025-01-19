import { SalesDataRow } from '../../types/import';
import { parseExcelData } from './parser';
import { validateExcelData } from '../validation';
import { logOperation } from '../../services/firebase/logging';

export const processExcelData = async (data: any[]): Promise<SalesDataRow[]> => {
  try {
    logOperation('processExcelData', 'start');

    // Validate data first
    const validationErrors = validateExcelData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed with ${validationErrors.length} errors`);
    }

    // Parse data if validation passes
    const parsedData = parseExcelData(data);
    
    logOperation('processExcelData', 'success', { rowCount: parsedData.length });
    return parsedData;
  } catch (error) {
    logOperation('processExcelData', 'error', error);
    throw error;
  }
};