import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  sendPasswordResetEmail, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { getAuth } from '../services/firebase/db';
import { initializeFirebaseServices } from '../services/firebase/init';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { logOperation } from '../services/firebase/logging';
import { initNetworkMonitoring, getNetworkStatus } from '../services/firebase/network';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../types/auth';
import { signIn as firebaseSignIn } from '../services/auth';
import { loadUserProfile } from '../services/auth/init';
import { initializeAuthSession, clearSessionState } from '../services/auth/session';
import { waitForNetwork } from '../services/firebase/network';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initAttempts, setInitAttempts] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const MAX_INIT_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;
  const NETWORK_TIMEOUT = 30000; // 30 seconds
  
  // Initialize Firebase on mount
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const init = async () => {
      if (isInitialized || isInitializing) return;
      
      try {
        setIsInitializing(true);
        setLoading(true);
        setError(null);
        setNetworkError(null);
        
        if (initAttempts >= MAX_INIT_ATTEMPTS) {
          throw new Error('Failed to initialize after multiple attempts');
        }

        // Wait for network if offline
        if (!navigator.onLine) {
          const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
          if (!hasNetwork) {
            throw new Error('No network connection available');
          }
        }

        logOperation('AuthProvider.init', 'start', { attempt: initAttempts + 1 });
        await initializeFirebaseServices();
        
        if (mounted) {
          setIsInitialized(true);
          setInitAttempts(0);
          setAuthReady(true);
          logOperation('AuthProvider.init', 'success');
        }
      } catch (error) {
        if (mounted) {
          setInitAttempts(prev => prev + 1);
          const message = error instanceof Error ? error.message : 'Failed to initialize Firebase';
          setError(message);
          logOperation('AuthProvider.init', 'error', error);
          
          // Retry after delay if not max attempts
          if (initAttempts < MAX_INIT_ATTEMPTS - 1) {
            timeoutId = setTimeout(init, RETRY_DELAY * (initAttempts + 1));
          }
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
          setLoading(false);
        }
      }
    };

    init();
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [initAttempts, isInitialized, isInitializing]);

  // Monitor network status
  useEffect(() => {
    const cleanup = initNetworkMonitoring(
      // On online
      () => {
        setError(null);
        setNetworkError(null);
      },
      // On offline
      () => {
        setNetworkError('No internet connection. Please check your network and try again.');
      }
    );

    return cleanup;
  }, []);

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    
    if (!isInitialized) {
      return;
    }
    
    const auth = getAuth();
    
    const clearAuthState = () => {
      clearSessionState();
      if (mounted) {
        setUserProfile(null);
        setCurrentUser(null);
      }
    };

    unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setLoading(true);
          
          // Initialize auth session
          const isValid = await initializeAuthSession(user);
          if (!isValid && mounted) {
            clearAuthState();
            return;
          }

          // Load user profile
          const profile = await loadUserProfile(user.uid);
          if (profile && mounted) {
            setUserProfile(profile);
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userRole', profile.role);
            setCurrentUser(user);
            setAuthReady(true);
          } else {
            logOperation('authStateChange', 'warning', 'No user profile found');
            clearAuthState();
          }
        } else {
          clearAuthState();
          setAuthReady(true);
        }
      } catch (err) {
        logOperation('authStateChange', 'error', err);
        clearAuthState();
        setAuthReady(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [isInitialized]);


  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      logOperation('AuthProvider.signIn', 'start', { email });
      
      const result = await firebaseSignIn(email, password);
      
      // Set auth state
      setCurrentUser(result.user);
      setUserProfile(result.profile);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', result.profile.role);
      
      logOperation('AuthProvider.signIn', 'success', { 
        role: result.profile.role,
        redirect: result.redirectPath
      });
      
      // Use navigate for SPA routing
      navigate(result.redirectPath, { replace: true });

    } catch (error) {
      logOperation('signIn', 'error', error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      setError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      clearSessionState();
      setUserProfile(null);
      setAuthReady(false);
      setCurrentUser(null);
      const auth = getAuth();
      await firebaseSignOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      logOperation('signOut', 'error', error);
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      setError(message);
      throw new Error(message);
    }
  };

  // Only render children when auth is ready
  if (!authReady) {
    return <LoadingScreen 
      error={error}
      networkError={!navigator.onLine ? 'No internet connection' : networkError}
      retryCount={initAttempts}
      maxRetries={MAX_INIT_ATTEMPTS}
      isOffline={!getNetworkStatus().isOnline}
    />;
  }

  const value = {
    currentUser,
    userProfile,
    signIn,
    resetPassword,
    signOut,
    loading,
    error,
    isInitialized,
    authReady
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};