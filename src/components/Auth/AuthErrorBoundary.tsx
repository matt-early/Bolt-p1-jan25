import React, { Component, ErrorInfo } from 'react';
import { logOperation } from '../../services/firebase/logging';
import { clearSessionState } from '../../services/auth/session';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logOperation('AuthErrorBoundary', 'error', {
      error: error.message,
      componentStack: errorInfo.componentStack
    });

    // Clear auth state on critical errors
    if (this.isCriticalError(error)) {
      clearSessionState();
      window.location.href = '/login';
    }
  }

  private isCriticalError(error: Error): boolean {
    return error.message.includes('auth') || 
           error.message.includes('token') ||
           error.message.includes('permission');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 text-red-500">⚠️</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Authentication Error
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {this.state.error?.message || 'There was a problem with your authentication session. Please try signing in again.'}
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}