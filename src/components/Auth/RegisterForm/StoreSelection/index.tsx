import React, { useState, useEffect } from 'react';
import { Store, Region } from '../../../../types';
import { logOperation } from '../../../../services/firebase/logging';
import { RegionSelect } from './RegionSelect';
import { StoreSelect } from './StoreSelect';
import { AdditionalStores } from './AdditionalStores';

interface StoreSelectionProps {
  stores: Store[];
  regions: Region[];
  selectedStores: string[];
  primaryStoreId: string;
  onStoreSelect: (storeIds: string[]) => void;
  onPrimaryStoreSelect: (storeId: string) => void;
  error?: string;
}

export const StoreSelection: React.FC<StoreSelectionProps> = ({
  stores,
  regions,
  selectedStores,
  primaryStoreId,
  onStoreSelect,
  onPrimaryStoreSelect,
  error
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [filteredStores, setFilteredStores] = useState<Store[]>(stores);
  const [loading, setLoading] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Filter stores when region changes
  useEffect(() => {
    setLoading(true);
    try {
      if (!selectedRegionId) {
        setFilteredStores([]);
        setLoading(false);
        return;
      }

      const filtered = stores.filter(store => store.regionId === selectedRegionId);
      
      // Sort stores by branch number
      filtered.sort((a, b) => 
        a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
      );
      
      setFilteredStores(filtered);
      setStoreError(null);
    } catch (error) {
      logOperation('filterStores', 'error', error);
      setStoreError('Failed to load stores for selected region');
    } finally {
      setLoading(false);
    }
  }, [selectedRegionId, stores]);

  // Update region when primary store changes
  useEffect(() => {
    if (primaryStoreId) {
      const store = stores.find(s => s.id === primaryStoreId);
      if (store) {
        setSelectedRegionId(store.regionId);
        // Filter stores for this region
        const filtered = stores.filter(s => s.regionId === store.regionId);
        setFilteredStores(filtered);
      }
    }
  }, [primaryStoreId, stores]);

  const handlePrimaryStoreChange = (storeId: string) => {
    // Update primary store first
    onPrimaryStoreSelect(storeId);
    
    if (storeId) {
      const store = stores.find(s => s.id === storeId);
      if (store) {
        // Update region to match store's region
        setSelectedRegionId(store.regionId);
        setStoreError('');
      }
    }
  };

  const handleStoreToggle = (storeId: string) => {
    // Prevent toggling primary store
    if (storeId === primaryStoreId) {
      return;
    }

    // Update store selection
    const updatedSelection = selectedStores.includes(storeId)
      ? selectedStores.filter(id => id !== storeId)
      : [...selectedStores, storeId];

    onStoreSelect(updatedSelection);
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    
    // Clear primary store when region changes
    if (primaryStoreId) {
      const currentStore = stores.find(s => s.id === primaryStoreId);
      if (currentStore?.regionId !== regionId) {
        onPrimaryStoreSelect('');
        onStoreSelect([]);
      }
    }
  };
  return (
    <div className="space-y-4">
      <RegionSelect
        regions={regions}
        selectedRegionId={selectedRegionId}
        onChange={handleRegionChange}
        error={error}
      />

      <StoreSelect
        stores={filteredStores}
        selectedStoreId={primaryStoreId}
        onChange={handlePrimaryStoreChange}
        disabled={!selectedRegionId || loading}
        error={storeError || error}
        label="Primary Store Location"
        isPrimary
      />

      {primaryStoreId && (
        <AdditionalStores
          stores={filteredStores}
          selectedStores={selectedStores}
          primaryStoreId={primaryStoreId}
          onStoreToggle={handleStoreToggle}
          disabled={loading}
        />
      )}
    </div>
  );
};