import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Region } from '../../../types';

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Region>) => void;
  region: Region | null;
}

export const RegionModal: React.FC<RegionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  region,
}) => {
  const [formData, setFormData] = useState({
    name: '',
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (region) {
      setFormData({
        name: region.name,
      });
    } else {
      setFormData({
        name: '',
      });
    }

    // Focus the input when modal opens
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [region, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // Clear form data after successful submission
    setFormData({ name: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium">
            {region ? 'Edit Region' : 'Add Region'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Region Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter region name"
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {region ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};