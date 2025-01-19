import React from 'react';
import { Store } from '../../../../types';
import { ChevronDown } from 'lucide-react';
import { logOperation } from '../../../../services/firebase/logging';

interface StoreSelectProps {
  stores: Store[];
  selectedStoreId: string;
  onChange: (storeId: string) => void;
  disabled?: boolean;
  error?: string;
  label: string;
  isPrimary?: boolean;
}

export const StoreSelect: React.FC<StoreSelectProps> = ({
  stores,
  selectedStoreId,
  onChange,
  disabled,
  error,
  label,
  isPrimary
}) => {
  const sortedStores = [...stores].sort((a, b) => 
    a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
  );
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedStoreId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            block w-full pl-3 pr-10 py-2 text-base
            focus:outline-none focus:ring-blue-500 focus:border-blue-500 
            sm:text-sm rounded-md
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50' : 'bg-white'}
            ${isPrimary ? 'font-medium' : ''}
          `}
          required={isPrimary}
        >
          <option value="">{disabled ? 'Select a region first' : 'Select store'}</option>
          {sortedStores.filter(store => store.branchNumber).map((store) => (
            <option key={store.id} value={store.id}>
              {store.name} (Branch {store.branchNumber})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {!disabled && sortedStores.length === 0 && (
        <p className="mt-1 text-sm text-gray-500">No stores available for selected region</p>
      )}
    </div>
  );
};