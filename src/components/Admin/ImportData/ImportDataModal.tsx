import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload } from 'lucide-react';
import { importSalesData } from '../../../services/sales';
import { validateExcelData } from '../../../utils/validation';
import { readExcelFile } from '../../../utils/excel/reader';
import { processExcelData } from '../../../utils/excel/processor';
import { addImportHistory } from '../../../services/importHistory';
import { ValidationError } from '../../../utils/validation/types';
import { ImportProgress as ImportProgressType } from '../../../types/import';
import {
  ImportProgress,
  FileUploader,
  ValidationErrors,
  ModalHeader,
  ModalFooter
} from './components';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgressType>({
    currentStep: '',
    progress: 0,
    totalRows: 0,
    processedRows: 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = async (file: File): Promise<boolean> => {
    try {
      setValidating(true);
      setValidationErrors([]);
      setImportProgress({
        currentStep: 'Validating file...',
        progress: 0,
        totalRows: 0,
        processedRows: 0
      });

      const result = await readExcelFile(file);
      if (!result.success) {
        setError(result.error);
        return false;
      }

      const validationResult = validateExcelData(result.data!);
      setValidationErrors(validationResult.errors || []);
      
      return validationResult.errors.length === 0;
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate file');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        setError('Please select an Excel (.xlsx) file');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      
      const isValid = await validateFile(selectedFile);
      if (!isValid) {
        setError('File validation failed. Please check the errors below.');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Read the file
      const readResult = await readExcelFile(file);
      if (!readResult.success) {
        throw new Error(readResult.error);
      }

      // Process the data
      setImportProgress({
        currentStep: 'Processing data...',
        progress: 0,
        totalRows: readResult.data!.length - 1, // Subtract header row
        processedRows: 0
      });

      const processedData = await processExcelData(readResult.data!);

      // Import the data
      setImportProgress({
        currentStep: 'Importing data...',
        progress: 50,
        totalRows: processedData.length,
        processedRows: 0
      });

      await importSalesData(processedData, (progress) => {
        setImportProgress(prev => ({
          ...prev,
          progress: 50 + (progress * 0.5),
          processedRows: Math.floor(processedData.length * progress)
        }));
      });

      // Record successful import
      await addImportHistory({
        fileName: file.name,
        success: true,
        rowsProcessed: processedData.length
      });
      
      setSuccess(true);
      setFile(null);
      setValidationErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onComplete();
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Error processing file. Please check the file format.');
      await addImportHistory({
        fileName: file.name,
        success: false,
        rowsProcessed: 0,
        error: (err as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <ModalHeader onClose={onClose} />

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
              <X className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              <span className="text-sm">Data imported successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <FileUploader
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading || validating}
            />

            {(loading || validating) && (
              <ImportProgress {...importProgress} />
            )}

            {validationErrors.length > 0 && (
              <ValidationErrors errors={validationErrors} />
            )}

            <ModalFooter
              onClose={onClose}
              onImport={handleImport}
              disabled={!file || loading || validating || validationErrors.length > 0}
              loading={loading}
              validating={validating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};