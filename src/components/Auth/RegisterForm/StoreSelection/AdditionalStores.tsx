import React from 'react';
import { Store } from '../../../../types';

interface AdditionalStoresProps {
  stores: Store[];
  selectedStores: string[];
  primaryStoreId: string;
  onStoreToggle: (storeId: string) => void;
  disabled?: boolean;
}

export const AdditionalStores: React.FC<AdditionalStoresProps> = ({
  stores,
  selectedStores,
  primaryStoreId,
  onStoreToggle,
  disabled
}) => {
  const sortedStores = [...stores].sort((a, b) => 
    a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Additional Store Locations
      </label>
      <div className={`
        mt-2 p-3 border rounded-md space-y-2 max-h-48 overflow-y-auto
        ${disabled ? 'bg-gray-50' : 'bg-white'}
      `}>
        {sortedStores.map((store) => (
          <label key={store.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedStores.includes(store.id)}
              onChange={() => onStoreToggle(store.id)}
              disabled={disabled || store.id === primaryStoreId}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`ml-2 text-sm ${
              store.id === primaryStoreId ? 'text-blue-600 font-medium' : 'text-gray-700'
            }`}>
              {store.name} (Branch {store.branchNumber})
              {store.id === primaryStoreId && (
                <span className="ml-2 text-xs text-blue-600">(Primary)</span>
              )}
            </span>
          </label>
        ))}
        {sortedStores.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No additional stores available
          </p>
        )}
      </div>
    </div>
  );
};