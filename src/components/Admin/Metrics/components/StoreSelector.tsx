import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Store, Region } from '../../../../types';

interface StoreSelectorProps {
  stores: Store[];
  regions: Region[];
  selectedStoreId: string;
  onStoreSelect: (storeId: string) => void;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  regions,
  selectedStoreId,
  onStoreSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group stores by region
  const storesByRegion = regions.reduce((acc, region) => {
    acc[region.id] = stores.filter(store => store.regionId === region.id);
    return acc;
  }, {} as Record<string, Store[]>);

  const getSelectedStoreName = () => {
    if (selectedStoreId === 'all') return 'All Stores';
    const store = stores.find(s => s.id === selectedStoreId);
    return store ? `${store.name} (Branch ${store.branchNumber})` : 'Select Store';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-64 px-4 py-2 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{getSelectedStoreName()}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 bg-white rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                onStoreSelect('all');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
            >
              All Stores
            </button>

            {regions.map(region => (
              <div key={region.id}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  {region.name}
                </div>
                {storesByRegion[region.id]?.map(store => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onStoreSelect(store.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      selectedStoreId === store.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {store.name} (Branch {store.branchNumber})
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};