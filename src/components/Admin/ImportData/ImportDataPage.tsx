import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { ImportDataModal } from './ImportDataModal';
import { ImportHistory } from './components';
import { getRecentImports } from '../../../services/importHistory';
import { ImportHistoryEntry } from '../../../types/import';

export const ImportDataPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      setLoading(true);
      const recentImports = await getRecentImports();
      setHistory(recentImports);
    } catch (error) {
      console.error('Error loading import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportComplete = () => {
    loadImportHistory();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Import Sales Data</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Import Sales Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload an Excel file containing sales data for processing
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="w-5 h-5 mr-2" />
              Select File
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h4 className="text-sm font-medium text-gray-900">File Requirements:</h4>
          <ul className="mt-4 space-y-3 text-sm text-gray-500 list-disc list-inside">
            <li>Excel file format (.xlsx)</li>
            <li>First row must contain headers</li>
            <li>Required columns in order:
              <ul className="ml-6 mt-2 space-y-1 list-disc">
                <li>Date</li>
                <li>Branch Number</li>
                <li>Staff Code</li>
                <li>Cellnet: Quantity, Sales Value, Margin</li>
                <li>Likewize Acc: Quantity, Sales Value, Margin</li>
                <li>Pacificomm: Quantity, Sales Value, Margin</li>
                <li>Studiotech: Quantity, Sales Value, Margin</li>
                <li>Likewize Device: Quantity only</li>
              </ul>
            </li>
          </ul>
        </div>

        {!loading && <ImportHistory history={history} />}
      </div>

      <ImportDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleImportComplete}
      />
    </div>
  );
};