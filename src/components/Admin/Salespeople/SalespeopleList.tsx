import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { UserProfile } from '../../../types/auth';
import { Store } from '../../../types';
import { fetchSalespeople, updateSalesperson, deleteSalesperson, createSalesperson } from '../../../services/salespeople';
import { fetchStores } from '../../../services/stores';
import { SalespersonModal } from './SalespersonModal';

export const SalespeopleList: React.FC = () => {
  const [salespeople, setSalespeople] = useState<UserProfile[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salespeopleData, storesData] = await Promise.all([
        fetchSalespeople(),
        fetchStores()
      ]);
      setSalespeople(salespeopleData);
      setStores(storesData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (salesperson: UserProfile) => {
    setSelectedSalesperson(salesperson);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteSalesperson(id);
        setSalespeople(salespeople.filter(sp => sp.id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete team member');
        console.error('Error deleting team member:', err);
      }
    }
  };

  const handleSave = async (data: Partial<UserProfile>) => {
    try {
      if (selectedSalesperson) {
        await updateSalesperson(selectedSalesperson.id, data);
        setSalespeople(salespeople.map(sp => 
          sp.id === selectedSalesperson.id ? { ...sp, ...data } : sp
        ));
      } else {
        const newId = await createSalesperson(data as Omit<UserProfile, 'id'>);
        setSalespeople([...salespeople, { id: newId, ...data as Omit<UserProfile, 'id'> }]);
      }
      setIsModalOpen(false);
      setSelectedSalesperson(null);
      setError(null);
    } catch (err) {
      setError(selectedSalesperson ? 'Failed to update team member' : 'Failed to create team member');
      console.error('Error saving team member:', err);
    }
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? `${store.name} (Branch ${store.branchNumber})` : 'Unknown Store';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-600">Loading team members...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-500 mt-1">
            {salespeople.filter(sp => !sp.disabled).length} active, {salespeople.filter(sp => sp.disabled).length} disabled
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedSalesperson(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Team Member
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
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Additional Stores
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salespeople.map((salesperson) => (
              <tr 
                key={salesperson.id} 
                className={`${salesperson.disabled ? 'opacity-50 bg-gray-50' : ''} transition-opacity duration-200`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`text-sm font-medium ${salesperson.disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                      <span>
                        {salesperson.name}
                      </span>
                      {salesperson.disabled && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className={salesperson.disabled ? 'text-gray-400' : ''}>
                        {salesperson.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={salesperson.disabled ? 'text-gray-400' : 'text-gray-500'}>
                    {salesperson.staffCode}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={salesperson.disabled ? 'text-gray-400' : 'text-gray-500'}>
                    {getStoreName(salesperson.primaryStoreId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={salesperson.disabled ? 'text-gray-400' : 'text-gray-500'}>
                    {salesperson.storeIds
                      .filter(id => id !== salesperson.primaryStoreId)
                      .map(id => getStoreName(id))
                      .join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(salesperson)}
                    className={`mr-4 ${
                      salesperson.disabled 
                        ? 'text-blue-400 hover:text-blue-500' 
                        : 'text-blue-600 hover:text-blue-900'
                    }`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(salesperson.id)}
                    className={
                      salesperson.disabled 
                        ? 'text-red-400 hover:text-red-500' 
                        : 'text-red-600 hover:text-red-900'
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {salespeople.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No team members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SalespersonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSalesperson(null);
        }}
        onSave={handleSave}
        salesperson={selectedSalesperson}
        stores={stores}
      />
    </div>
  );
};