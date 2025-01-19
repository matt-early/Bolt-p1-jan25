import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Store, Region } from '../../../types';
import { fetchRegions } from '../../../services/regions';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Store>) => void;
  store: Store | null;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  store,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    branchNumber: '',
    regionId: '',
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        const data = await fetchRegions();
        setRegions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load regions');
        console.error('Error loading regions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadRegions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        branchNumber: store.branchNumber,
        regionId: store.regionId,
      });
    } else {
      setFormData({
        name: '',
        branchNumber: '',
        regionId: '',
      });
    }

    // Focus the name input when modal opens
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [store, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // Clear form data after successful submission
    setFormData({
      name: '',
      branchNumber: '',
      regionId: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium">
            {store ? 'Edit Store' : 'Add Store'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter store name"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Branch Number
              </label>
              <input
                type="text"
                value={formData.branchNumber}
                onChange={(e) => setFormData({ ...formData, branchNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter branch number"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <select
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              {regions.length === 0 && !loading && (
                <p className="mt-1 text-sm text-gray-500">
                  No regions available. Please create a region first.
                </p>
              )}
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
              disabled={loading || regions.length === 0}
            >
              {store ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};