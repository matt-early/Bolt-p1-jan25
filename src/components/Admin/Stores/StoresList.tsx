import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Store, Region } from '../../../types';
import { fetchStores, updateStore, deleteStore, createStore } from '../../../services/stores';
import { fetchRegions } from '../../../services/regions';
import { StoreModal } from './StoreModal';

export const StoresList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesData, regionsData] = await Promise.all([
        fetchStores(),
        fetchRegions()
      ]);
      // Sort stores by branch number
      const sortedStores = [...storesData].sort((a, b) => 
        a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
      );
      setStores(sortedStores);
      setRegions(regionsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(id);
        setStores(stores.filter(store => store.id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete store');
        console.error('Error deleting store:', err);
      }
    }
  };

  const handleSave = async (data: Partial<Store>) => {
    try {
      if (selectedStore) {
        await updateStore(selectedStore.id, data);
        const updatedStores = stores.map(store => 
          store.id === selectedStore.id ? { ...store, ...data } : store
        );
        // Sort after update
        setStores(updatedStores.sort((a, b) => 
          a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
        ));
      } else {
        const newStoreId = await createStore(data as Omit<Store, 'id'>);
        const newStore = { id: newStoreId, ...data as Omit<Store, 'id'> };
        // Sort after adding new store
        setStores([...stores, newStore].sort((a, b) => 
          a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
        ));
      }
      setIsModalOpen(false);
      setSelectedStore(null);
      setError(null);
    } catch (err) {
      setError(selectedStore ? 'Failed to update store' : 'Failed to create store');
      console.error('Error saving store:', err);
    }
  };

  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Unknown Region';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading stores...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Stores</h2>
        <button
          onClick={() => {
            setSelectedStore(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Store
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
                Store Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {store.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {store.branchNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getRegionName(store.regionId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(store)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No stores found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStore(null);
        }}
        onSave={handleSave}
        store={selectedStore}
        regions={regions}
      />
    </div>
  );
};