import React from 'react';
import { FileCheck, FileX, Clock } from 'lucide-react';
import { ImportHistoryEntry } from '../../../../types/import';
import { formatDistanceToNow } from '../../../../utils/dateUtils';

interface ImportHistoryProps {
  history: ImportHistoryEntry[];
}

export const ImportHistory: React.FC<ImportHistoryProps> = ({ history }) => (
  <div className="mt-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Imports</h3>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {history.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No import history available
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {history.map((entry) => (
            <li key={entry.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {entry.success ? (
                    <FileCheck className="w-5 h-5 text-green-500 mr-3" />
                  ) : (
                    <FileX className="w-5 h-5 text-red-500 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.fileName}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {entry.rowsProcessed.toLocaleString()} rows
                  </p>
                  {entry.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {entry.error}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);