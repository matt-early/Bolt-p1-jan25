// Add to existing types
export interface ImportHistoryEntry {
  id: string;
  fileName: string;
  timestamp: Date;
  success: boolean;
  rowsProcessed: number;
  error?: string;
}

export interface ImportProgress {
  currentStep: string;
  progress: number;
  totalRows: number;
  processedRows: number;
}