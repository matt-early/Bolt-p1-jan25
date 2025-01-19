import * as XLSX from 'xlsx';
import { ExcelProcessingResult } from './types';
import { logOperation } from '../../services/firebase/logging';

export const readExcelFile = async (file: File): Promise<ExcelProcessingResult> => {
  try {
    logOperation('readExcelFile', 'start', { fileName: file.name });

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { 
      type: 'array',
      cellDates: true,
      dateNF: 'dd/mm/yyyy', // Expected input format
    });

    // Get first sheet
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) {
      throw new Error('No sheets found in workbook');
    }

    // Convert to JSON with specific options for date handling
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      raw: false,
      dateNF: 'dd/mm/yyyy',
      defval: '',
      rawNumbers: false
    });

    logOperation('readExcelFile', 'success', { rowCount: jsonData.length });
    return {
      success: true,
      data: jsonData
    };
  } catch (error) {
    logOperation('readExcelFile', 'error', error);
    return {
      success: false,
      error: 'Failed to read Excel file: ' + (error as Error).message
    };
  }
};