import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { SignInPage } from './components/Auth/SignInPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { UnauthorizedPage } from './components/Auth/UnauthorizedPage';
import { AdminLayout } from './components/Admin/AdminLayout';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { RegionalDashboard } from './components/Regional/RegionalDashboard';
import { TeamMemberDashboard } from './components/TeamMember/TeamMemberDashboard';
import { SalespeopleList } from './components/Admin/Salespeople/SalespeopleList';
import { StoresList } from './components/Admin/Stores/StoresList';
import { RegionsList } from './components/Admin/Regions/RegionsList';
import { RegionMetrics } from './components/Admin/Metrics/RegionMetrics';
import { SalespersonMetrics } from './components/Admin/Metrics/SalespersonMetrics';
import { ImportDataPage } from './components/Admin/ImportData/ImportDataPage';
import { AuthRequestList } from './components/Admin/Auth/AuthRequestList';
import { UserManagement } from './components/Admin/Auth/UserManagement';
import { LoadingScreen } from './components/common/LoadingScreen';

const App: React.FC = () => {
  const { loading, currentUser } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!currentUser && window.location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/admin" replace />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/auth-requests" element={<AuthRequestList />} />
        <Route path="admin/import" element={<ImportDataPage />} />

        <Route path="regional" element={<RegionalDashboard />} />
        <Route path="dashboard" element={<TeamMemberDashboard />} />

        <Route path="salespeople" element={<SalespeopleList />} />
        <Route path="stores" element={<StoresList />} />
        <Route path="regions" element={<RegionsList />} />
        <Route path="metrics/regions" element={<RegionMetrics />} />
        <Route path="metrics/salespeople" element={<SalespersonMetrics />} />
      </Route>
    </Routes>
  );
};

export default App;