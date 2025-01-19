import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../../../types/auth';
import { Store } from '../../../types';

interface SalespersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<UserProfile>) => void;
  salesperson: UserProfile | null;
  stores: Store[];
}

export const SalespersonModal: React.FC<SalespersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  salesperson,
  stores,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    staffCode: '',
    primaryStoreId: '',
    storeIds: [] as string[],
  });
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [availableStores, setAvailableStores] = useState<Store[]>([]);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update available stores when primary store changes
  useEffect(() => {
    if (formData.primaryStoreId) {
      const primaryStore = stores.find(s => s.id === formData.primaryStoreId);
      if (primaryStore) {
        setSelectedRegionId(primaryStore.regionId);
        const regionStores = stores.filter(s => s.regionId === primaryStore.regionId);
        setAvailableStores(regionStores);
      }
    } else {
      setSelectedRegionId('');
      setAvailableStores([]);
    }
  }, [formData.primaryStoreId, stores]);

  useEffect(() => {
    if (salesperson) {
      setFormData({
        name: salesperson.name,
        email: salesperson.email,
        staffCode: salesperson.staffCode,
        primaryStoreId: salesperson.primaryStoreId,
        storeIds: salesperson.storeIds,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        staffCode: '',
        primaryStoreId: '',
        storeIds: [],
      });
    }

    // Focus the name input when modal opens
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [salesperson, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // Clear form data after successful submission
    setFormData({
      name: '',
      staffCode: '',
      primaryStoreId: '',
      storeIds: [],
    });
  };

  const handleStoreSelection = (storeId: string, isPrimary: boolean = false) => {
    if (isPrimary) {
      const store = stores.find(s => s.id === storeId);
      if (!store) return;

      // Update primary store and reset store selections to only include primary store
      setFormData(prev => ({
        ...prev,
        primaryStoreId: storeId,
        storeIds: [storeId]
      }));
    } else {
      // Toggle store in storeIds
      setFormData(prev => ({
        ...prev,
        storeIds: prev.storeIds.includes(storeId)
          ? prev.storeIds.filter(id => id !== storeId)
          : [...prev.storeIds, storeId],
        // Never remove primary store from storeIds
        primaryStoreId: prev.primaryStoreId
      }));
    }
  };

  if (!isOpen) return null;

  // Sort stores by branch number
  const sortedStores = [...stores].sort((a, b) => 
    a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium">
            {salesperson ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter team member name"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter email address"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Staff Code
              </label>
              <input
                type="text"
                value={formData.staffCode}
                onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter staff code"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Store
              </label>
              <select
                value={formData.primaryStoreId}
                onChange={(e) => handleStoreSelection(e.target.value, true)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select primary store</option>
                {stores
                  .sort((a, b) => a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true }))
                  .map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name} (Branch {store.branchNumber})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Stores
                {selectedRegionId && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Same region as primary store)
                  </span>
                )}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableStores
                  .sort((a, b) => a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true }))
                  .map((store) => (
                  <label key={store.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.storeIds.includes(store.id)}
                      onChange={() => handleStoreSelection(store.id)}
                      disabled={store.id === formData.primaryStoreId}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {store.name} (Branch {store.branchNumber})
                      {store.id === formData.primaryStoreId && 
                        <span className="ml-2 text-xs text-blue-600">(Primary Store)</span>
                      }
                    </span>
                  </label>
                ))}
                {!formData.primaryStoreId && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Select a primary store first
                  </p>
                )}
              </div>
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
              {salesperson ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};