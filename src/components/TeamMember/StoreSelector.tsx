import React from 'react';
import { Store } from '../../types';

interface StoreSelectorProps {
  stores: Store[];
  selectedStoreId: string | null;
  onStoreSelect: (storeId: string | null) => void;
  primaryStoreId?: string;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  selectedStoreId,
  onStoreSelect,
  primaryStoreId
}) => {
  const sortedStores = [...stores].sort((a, b) => 
    a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <div className="text-sm font-medium text-gray-700">
        Store Location:
      </div>
      <select
        value={selectedStoreId || ''}
        onChange={(e) => onStoreSelect(e.target.value || null)}
        className="w-full sm:w-auto min-w-[250px] rounded-md border-gray-300 shadow-sm 
                 focus:border-blue-500 focus:ring-blue-500 text-sm"
      >
        <option value="">All My Stores</option>
        {sortedStores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} (Branch {store.branchNumber})
            {store.id === primaryStoreId ? ' (Primary Store)' : ''}
          </option>
        ))}
      </select>
      {selectedStoreId && (
        <button
          onClick={() => onStoreSelect(null)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All Stores
        </button>
      )}
    </div>
  );
};