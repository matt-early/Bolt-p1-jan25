import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => (
  <div className="flex items-center justify-between p-6 border-b">
    <h3 className="text-lg font-medium">Import Sales Data</h3>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
      <X className="w-6 h-6" />
    </button>
  </div>
);