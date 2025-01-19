import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Store, Region } from '../../../types';
import { validateEmail } from '../../../utils/validation/emailValidator';
import { checkEmailExists } from '../../../services/auth/validation';
import { fetchStores } from '../../../services/stores';
import { fetchRegions } from '../../../services/regions';
import { createAuthRequest } from '../../../services/auth';
import { PasswordInput } from './PasswordInput';
import { StoreSelection } from './StoreSelection';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const STAFF_CODE_REGEX = /^[A-Za-z0-9-]+$/;

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    staffCode: '',
    primaryStoreId: '',
    storeIds: [] as string[],
    password: '',
    confirmPassword: ''
  });
  
  const [stores, setStores] = useState<Store[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Load stores and regions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [storesData, regionsData] = await Promise.all([
          fetchStores(),
          fetchRegions()
        ]);
        setStores(storesData);
        setRegions(regionsData);
        setError(null);
      } catch (err) {
        setError('Failed to load store and region data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Validation functions
  const validatePassword = (password: string): string | null => {
    if (!PASSWORD_REGEX.test(password)) {
      return 'Password must be at least 8 characters and include uppercase, lowercase, and numbers';
    }
    return null;
  };

  const validateStaffCode = (code: string): string | null => {
    if (!STAFF_CODE_REGEX.test(code)) {
      return 'Staff code can only contain letters, numbers, and hyphens';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);

    try {
      // Validate email
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setErrors({ email: emailValidation.error || 'Invalid email' });
        setLoading(false);
        return;
      }

      // Check for duplicate email
      try {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setErrors({ email: 'This email is already registered' });
          setLoading(false);
          return;
        }
      } catch (err) {
        // Ignore permission errors for email check
        console.log('Email check skipped:', err);
      }

      // Validate all fields
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      const staffCodeError = validateStaffCode(formData.staffCode);
      if (staffCodeError) {
        setError(staffCodeError);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!formData.primaryStoreId) {
        setErrors({ stores: 'Primary store location is required' });
        return;
      }

      try {
        setErrors({});
        await createAuthRequest({
          email: formData.email.toLowerCase().trim(),
          name: formData.name.trim(),
          staffCode: formData.staffCode.trim(),
          password: formData.password,
          storeIds: formData.storeIds,
          primaryStoreId: formData.primaryStoreId,
          role: 'team_member',
          status: 'pending'
        });

        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit registration request';
        setError(message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit registration request';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <div className="text-sm text-green-700">
          Registration request submitted successfully! You will be notified once your request is approved.
          Redirecting to login page...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm
            ${errors.email ? 'border-red-300' : 'border-gray-300'}
            focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="staffCode" className="block text-sm font-medium text-gray-700">
          Staff Code
        </label>
        <input
          type="text"
          id="staffCode"
          value={formData.staffCode}
          onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <StoreSelection
        stores={stores}
        regions={regions}
        selectedStores={formData.storeIds}
        primaryStoreId={formData.primaryStoreId}
        onStoreSelect={(storeIds) => {
          console.log('Updating store selection:', storeIds);
          setFormData(prev => ({
            ...prev,
            storeIds
          }));
        }}
        onPrimaryStoreSelect={(storeId) => {
          console.log('Updating primary store:', storeId);
          setFormData(prev => ({
            ...prev,
            primaryStoreId: storeId,
            // Ensure primary store is in storeIds
            storeIds: storeId ? [storeId] : []
          }));
        }}
        error={errors.stores}
      />

      <PasswordInput
        id="password"
        label="Password"
        value={formData.password}
        onChange={(value) => setFormData({ ...formData, password: value })}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
      />

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </div>
    </form>
  );
};