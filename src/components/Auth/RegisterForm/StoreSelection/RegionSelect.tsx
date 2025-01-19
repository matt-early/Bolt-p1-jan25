import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Region } from '../../../../types';
import { logOperation } from '../../../../services/firebase/logging';

interface RegionSelectProps {
  regions: Region[];
  selectedRegionId: string;
  onChange: (regionId: string) => void;
  disabled?: boolean;
  error?: string;
}

export const RegionSelect: React.FC<RegionSelectProps> = ({
  regions,
  selectedRegionId,
  onChange,
  disabled,
  error
}) => {
  // Filter out regions without names and sort
  const validRegions = [...regions]
    .filter(region => region.name?.trim())
    .sort((a, b) => a.name.localeCompare(b.name));

  // Log available regions for debugging
  logOperation('RegionSelect.render', 'debug', { 
    totalRegions: regions.length,
    validRegions: validRegions.length 
  });

  const handleChange = (value: string) => {
    logOperation('RegionSelect.onChange', 'start', { value });
    onChange(value);
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Region
      </label>
      <div className="relative">
        <select
          value={selectedRegionId}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className={`
            block w-full pl-3 pr-10 py-2 text-base border-gray-300 
            focus:outline-none focus:ring-blue-500 focus:border-blue-500 
            sm:text-sm rounded-md
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50' : 'bg-white'}
          `}
        >
          <option value="">Select a region</option>
          {validRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
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
      {validRegions.length === 0 && (
        <p className="mt-1 text-sm text-gray-500">No regions available</p>
      )}
    </div>
  );
};