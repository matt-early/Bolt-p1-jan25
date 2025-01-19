import React from 'react';
import { Store, Region } from '../../../types';
import { useMemo, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface StoreSelectProps {
  stores: Store[];
  selectedStores: string[];
  onStoreSelect: (storeIds: string[]) => void;
  primaryStoreId: string;
  onPrimaryStoreSelect: (storeId: string) => void;
  error?: string;
}

export const StoreSelect: React.FC<StoreSelectProps> = ({
  stores,
  selectedStores,
  onStoreSelect,
  primaryStoreId,
  onPrimaryStoreSelect,
  error
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);

  const storesByRegion = useMemo(() => {
    const grouped = stores.reduce((acc, store) => {
      if (!store.regionId) return acc;
      
      if (!acc[store.regionId]) {
        acc[store.regionId] = {
          name: store.regionName || 'Unknown Region',
          stores: []
        };
      }
      acc[store.regionId].stores.push(store);
      return acc;
    }, {} as Record<string, { name: string; stores: Store[] }>);

    // Sort stores within each region by branch number
    Object.values(grouped).forEach(region => {
      region.stores.sort((a, b) => 
        a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
      );
    });

    return grouped;
  }, [stores]);

  // Update current region when primary store changes
  useEffect(() => {
    if (primaryStoreId) {
      const store = stores.find(s => s.id === primaryStoreId);
      if (store) {
        setCurrentRegion(store.regionId);
      }
    }
  }, [primaryStoreId, stores]);

  // Ensure primary store is always in selected stores
  useEffect(() => {
    if (primaryStoreId && !selectedStores.includes(primaryStoreId)) {
      onStoreSelect([...selectedStores, primaryStoreId]);
    }
  }, [primaryStoreId]);

  // Get the primary store's region ID
  const primaryStoreRegionId = useMemo(() => {
    if (!primaryStoreId) return null;
    return stores.find(store => store.id === primaryStoreId)?.regionId || null;
  }, [primaryStoreId, stores]);

  // Filter stores for additional selection based on primary store's region
  const availableStores = useMemo(() => {
    if (!primaryStoreRegionId) return stores;
    return stores.filter(store => store.regionId === primaryStoreRegionId);
  }, [stores, primaryStoreRegionId]);

  // Keep dropdown open state in sync with selection
  useEffect(() => {
    if (primaryStoreId) {
      setIsPrimaryOpen(false);
    }
  }, [primaryStoreId]);

  const handlePrimaryStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;
    
    // Update primary store, region, and selection
    onPrimaryStoreSelect(storeId);
    setCurrentRegion(store.regionId);
    onStoreSelect([storeId]); // Reset additional store selections
    
    // Close dropdown after selection
    setDropdownOpen(false);
  };

  const handleStoreToggle = (storeId: string) => {
    // Prevent toggling primary store
    if (storeId === primaryStoreId) return;

    // Get store's region
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    // Only allow selection if store is in same region as primary store
    const primaryStore = stores.find(s => s.id === primaryStoreId);
    if (!primaryStore || store.regionId !== primaryStore.regionId) return;

    if (selectedStores.includes(storeId)) {
      onStoreSelect(selectedStores.filter(id => id !== storeId));
    } else {
      onStoreSelect([...selectedStores, storeId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Primary Store Location
        </label>
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`relative w-full bg-white border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <span className="block truncate">
              {primaryStoreId ? (
                stores.find(s => s.id === primaryStoreId)
                  ? `${stores.find(s => s.id === primaryStoreId)!.name} (Branch ${stores.find(s => s.id === primaryStoreId)!.branchNumber})`
                  : 'Select primary store'
              ) : (
                'Select primary store'
              )}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {Object.entries(storesByRegion).map(([regionId, { name: regionName, stores: regionStores }]) => (
                <div key={regionId} className="py-1" role="group" aria-label={regionName || 'Unknown Region'}>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                    {regionName || 'Unknown Region'}
                  </div>
                  {regionStores.map(store => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => handlePrimaryStoreChange(store.id)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        store.id === primaryStoreId ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      {store.name} (Branch {store.branchNumber})
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Additional Store Locations
        </label>
        <div className="mt-2 p-3 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {primaryStoreId && Object.entries(storesByRegion)
              .filter(([regionId]) => regionId === primaryStoreRegionId)
              .map(([regionId, { name: regionName, stores: regionStores }]) => (
                <div key={regionId}>
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    {regionName || 'Region'} Stores
                  </div>
                  <div className="space-y-2">
                    {regionStores.map((store) => (
                      <label key={store.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.id)}
                          onChange={() => handleStoreToggle(store.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={store.id === primaryStoreId}
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
                  </div>
                </div>
              ))}
            {!primaryStoreId && (
              <p className="text-sm text-gray-500 text-center py-2">
                Select a primary store first
              </p>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {primaryStoreId ? (
            <>Additional stores must be in the same region as your primary store: <span className="font-medium">{stores.find(s => s.id === primaryStoreId)?.name}</span></>
          ) : (
            'Select a primary store first'
          )}
        </p>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};