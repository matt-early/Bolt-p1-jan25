import { SalesDataRow } from '../../../../types/import';
import { parseDateString } from '../../../../utils/dateUtils/parsers';
import { logOperation } from '../../../../services/firebase/logging';

export const processExcelData = async (jsonData: any[]): Promise<SalesDataRow[]> => {
  try {
    logOperation('processExcelData', 'start', { rowCount: jsonData.length });

    // Skip header row by starting from index 1
    const processedData = jsonData.slice(1).map((row, index) => {
      try {
        // Parse date in dd/mm/yyyy format
        const dateStr = row[0]?.toString().trim();
        const date = parseDateString(dateStr);
        if (!date) {
          throw new Error(`Invalid date format in row ${index + 2}: ${dateStr}. Expected dd/mm/yyyy`);
        }

        // Process numeric values - allow negative numbers
        const processNumber = (value: any): number => {
          if (value === undefined || value === null || value === '') return 0;
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        };

        const data: SalesDataRow = {
          date,
          branchNumber: row[1]?.toString().trim() || '',
          staffCode: row[2]?.toString().trim() || '',
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

        logOperation('processExcelRow', 'success', { row: index + 2 });
        return data;
      } catch (error) {
        logOperation('processExcelRow', 'error', { row: index + 2, error });
        throw new Error(`Error processing row ${index + 2}: ${(error as Error).message}`);
      }
    });

    logOperation('processExcelData', 'success', { rowCount: processedData.length });
    return processedData;
  } catch (error) {
    logOperation('processExcelData', 'error', error);
    throw error;
  }
};