import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { getAuth, getDb } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { AUTH_ERROR_MESSAGES } from '../../services/auth/errors';
import { logOperation } from '../../services/firebase/logging';
import { AUTH_SETTINGS } from '../../config/auth-settings';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code as keyof typeof AUTH_ERROR_MESSAGES] || 
           AUTH_ERROR_MESSAGES.default;
  }
  
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');

      if (!networkStatus) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if admin user
      const isAdmin = userCredential.user.email === AUTH_SETTINGS.DEFAULT_ADMIN.EMAIL;
      if (isAdmin) {
        navigate('/admin');
        return;
      }
      
      // Check user role in Firestore
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.data()?.role;
      
      // Route based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'regional') {
        navigate('/regional');
      } else {
        navigate('/dashboard');
      }
      
      setError(''); // Clear any existing errors
      logOperation('signIn', 'success');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      logOperation('signIn', 'error', { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {!networkStatus && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 p-4">
          <div className="flex justify-center text-yellow-800">
            <span className="text-sm">You are currently offline. Some features may be limited.</span>
          </div>
        </div>
      )}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline break-words">{error}</span>
          </div>
        )}
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <LogIn className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            <div className="mt-4 text-sm text-center space-y-2">
              <div>
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register for an account
                </Link>
              </div>
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};