import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id: string;
  label: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  id,
  label
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {id === 'password' && (
        <ul className="text-xs text-gray-500 space-y-1 mt-2">
          <li className={value.length >= 8 ? 'text-green-600' : ''}>
            • At least 8 characters
          </li>
          <li className={/[A-Z]/.test(value) ? 'text-green-600' : ''}>
            • At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(value) ? 'text-green-600' : ''}>
            • At least one lowercase letter
          </li>
          <li className={/\d/.test(value) ? 'text-green-600' : ''}>
            • At least one number
          </li>
        </ul>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};