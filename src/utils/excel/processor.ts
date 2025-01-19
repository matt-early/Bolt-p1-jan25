import { SalesDataRow } from '../../types/import';
import { logOperation } from '../../services/firebase/logging';
import { parseDateString } from '../dateUtils/parsers';
import { toNZDateTime } from '../dateUtils/timezone';

const processNumber = (value: any): number => {
  if (value === undefined || value === null || value === '') return 0;
  const num = Number(value);
  // Allow negative numbers for returns
  return isNaN(num) ? 0 : num;
};

const processDate = (value: any): Date => {
  try {
    // Handle string dates in dd/mm/yyyy format
    if (typeof value === 'string') {
      const parsedDate = parseDateString(value);
      if (parsedDate) return parsedDate;
    }

    // Handle JavaScript Date objects
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    throw new Error(`Invalid date value: ${value}`);
  } catch (error) {
    throw new Error(`Failed to process date: ${value}. Error: ${error.message}`);
  }
};

export const processRow = (row: any[], rowIndex: number): SalesDataRow => {
  try {
    const date = processDate(row[0]);
    
    // Log the date processing for debugging
    logOperation('processRow', 'debug', { 
      row: rowIndex,
      originalDate: row[0],
      processedDate: date.toISOString()
    });

    return {
      date,
      branchNumber: String(row[1]).trim(),
      staffCode: String(row[2]).trim(),
      cellnetQuantity: processNumber(row[3]),
      cellnetSales: processNumber(row[4]),
      cellnetMargin: processNumber(row[5]),
      likewizeAccQuantity: processNumber(row[6]),
      likewizeAccSales: processNumber(row[7]),
      likewizeAccMargin: processNumber(row[8]),
      pacificommQuantity: processNumber(row[9]),
      pacificommSales: processNumber(row[10]),
      pacificommMargin: processNumber(row[11]),
      studiotechQuantity: processNumber(row[12]),
      studiotechSales: processNumber(row[13]),
      studiotechMargin: processNumber(row[14]),
      likewizeDeviceQuantity: processNumber(row[15])
    };
  } catch (error) {
    logOperation('processRow', 'error', { 
      row: rowIndex, 
      error: error.message,
      data: row 
    });
    throw new Error(`Error processing row ${rowIndex}: ${error.message}`);
  }
};

export const processExcelData = async (data: any[]): Promise<SalesDataRow[]> => {
  try {
    logOperation('processExcelData', 'start', { rowCount: data.length });

    // Skip header row and process each data row
    const processedData = data.slice(1)
      .filter(row => row && row.some(cell => cell !== undefined && cell !== null && cell !== ''))
      .map((row, index) => {
        try {
          return processRow(row, index + 2);
        } catch (error) {
          logOperation('processExcelData', 'error', {
            row: index + 2,
            error: error.message
          });
          throw error;
        }
      });

    logOperation('processExcelData', 'success', { processedCount: processedData.length });
    return processedData;
  } catch (error) {
    logOperation('processExcelData', 'error', error);
    throw error;
  }
};