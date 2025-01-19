import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Region, Store } from '../../../types';
import { fetchRegions, updateRegion, deleteRegion, createRegion } from '../../../services/regions';
import { fetchStores } from '../../../services/stores';
import { RegionModal } from './RegionModal';

export const RegionsList: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regionsData, storesData] = await Promise.all([
        fetchRegions(),
        fetchStores()
      ]);
      setRegions(regionsData);
      setStores(storesData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (region: Region) => {
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Check if region has stores
    const regionStores = stores.filter(store => store.regionId === id);
    if (regionStores.length > 0) {
      alert(`Cannot delete region that has ${regionStores.length} store(s) assigned to it. Please reassign or delete the stores first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this region?')) {
      try {
        await deleteRegion(id);
        setRegions(regions.filter(region => region.id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete region');
        console.error('Error deleting region:', err);
      }
    }
  };

  const handleSave = async (data: Partial<Region>) => {
    try {
      if (selectedRegion) {
        await updateRegion(selectedRegion.id, data);
        setRegions(regions.map(region => 
          region.id === selectedRegion.id ? { ...region, ...data } : region
        ));
      } else {
        const newRegionId = await createRegion(data as Omit<Region, 'id'>);
        setRegions([...regions, { id: newRegionId, ...data as Omit<Region, 'id'> }]);
      }
      setIsModalOpen(false);
      setSelectedRegion(null);
      setError(null);
    } catch (err) {
      setError(selectedRegion ? 'Failed to update region' : 'Failed to create region');
      console.error('Error saving region:', err);
    }
  };

  const getStoreCount = (regionId: string): number => {
    return stores.filter(store => store.regionId === regionId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading regions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Regions</h2>
        <button
          onClick={() => {
            setSelectedRegion(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Region
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stores
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.map((region) => {
              const storeCount = getStoreCount(region.id);
              return (
                <tr key={region.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {region.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {storeCount} {storeCount === 1 ? 'store' : 'stores'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(region)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(region.id)}
                      className="text-red-600 hover:text-red-900"
                      title={storeCount > 0 ? "Cannot delete region with assigned stores" : "Delete region"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {regions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No regions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RegionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRegion(null);
        }}
        onSave={handleSave}
        region={selectedRegion}
      />
    </div>
  );
};