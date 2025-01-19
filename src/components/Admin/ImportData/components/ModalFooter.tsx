import React from 'react';
import { Upload } from 'lucide-react';

interface ModalFooterProps {
  onClose: () => void;
  onImport: () => void;
  disabled: boolean;
  loading: boolean;
  validating: boolean;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  onClose,
  onImport,
  disabled,
  loading,
  validating
}) => (
  <div className="flex justify-end space-x-3">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      disabled={loading || validating}
    >
      Cancel
    </button>
    <button
      onClick={onImport}
      disabled={disabled}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      <Upload className="w-4 h-4 mr-2" />
      {loading ? 'Importing...' : validating ? 'Validating...' : 'Import Data'}
    </button>
  </div>
);