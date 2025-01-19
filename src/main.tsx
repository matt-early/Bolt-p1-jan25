import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { AuthErrorBoundary } from './components/Auth/AuthErrorBoundary';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthErrorBoundary>
          <App />
        </AuthErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);