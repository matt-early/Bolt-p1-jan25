import { SalesDataRow } from '../../types/import';
import { logOperation } from '../../services/firebase/logging';

const parseNumber = (value: any): number => {
  // Handle empty or invalid values
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const num = Number(value);
  if (isNaN(num) || num < 0 || !isFinite(num)) {
    return 0;
  }

  // Round to 2 decimal places for sales and margin values
  return Number(num.toFixed(2));
};

const parseDate = (value: any): Date => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date;
};

export const parseExcelRow = (row: any[]): SalesDataRow => {
  try {
    return {
      date: parseDate(row[0]),
      branchNumber: row[1].toString().trim(),
      staffCode: row[2].toString().trim(),
      cellnetQuantity: Math.floor(parseNumber(row[3])), // Quantities must be whole numbers
      cellnetSales: parseNumber(row[4]),
      cellnetMargin: parseNumber(row[5]),
      likewizeAccQuantity: Math.floor(parseNumber(row[6])),
      likewizeAccSales: parseNumber(row[7]),
      likewizeAccMargin: parseNumber(row[8]),
      pacificommQuantity: Math.floor(parseNumber(row[9])),
      pacificommSales: parseNumber(row[10]),
      pacificommMargin: parseNumber(row[11]),
      studiotechQuantity: Math.floor(parseNumber(row[12])),
      studiotechSales: parseNumber(row[13]),
      studiotechMargin: parseNumber(row[14]),
      likewizeDeviceQuantity: Math.floor(parseNumber(row[15]))
    };
  } catch (error) {
    logOperation('parseExcelRow', 'error', error);
    throw new Error(`Failed to parse row: ${error.message}`);
  }
};

export const parseExcelData = (data: any[]): SalesDataRow[] => {
  try {
    // Skip header row and empty rows
    const rows = data.slice(1).filter(row => row && row.some(cell => cell));
    
    return rows.map((row, index) => {
      try {
        return parseExcelRow(row);
      } catch (error) {
        logOperation('parseExcelData', 'error', { row: index + 2, error });
        throw new Error(`Error in row ${index + 2}: ${error.message}`);
      }
    });
  } catch (error) {
    logOperation('parseExcelData', 'error', error);
    throw new Error('Failed to parse Excel data: ' + error.message);
  }
};