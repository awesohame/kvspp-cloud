import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/ContextHooks';
import { StoreProvider } from './context/StoreContext';
import { LandingPage } from './components/pages/LandingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Stores } from './components/pages/Stores';
import { StoreDetail } from './components/pages/StoreDetail';
import { AccountSettings } from './components/pages/AccountSettings';
import { ApiTokens } from './components/pages/ApiTokens';
import { AccessManagement } from './components/pages/AccessManagement';
import { Logs } from './components/pages/Logs';
import { LoadingSpinner } from './components/ui/loading-spinner';
import StoreInteractive from './components/pages/StoreInteractive';
import TryKVSppDemo from './components/pages/TryKVSppDemo';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/try-kvspp"
        element={
          <PublicRoute>
            <TryKVSppDemo />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/stores" replace />} />
        <Route path="stores" element={<Stores />} />
        <Route path="stores/:token" element={<StoreDetail />} />
        <Route path="stores/:token/interactive" element={<StoreInteractive />} />
        <Route path="account" element={<AccountSettings />} />
        <Route path="tokens" element={<ApiTokens />} />
        <Route path="access" element={<AccessManagement />} />
        <Route path="logs" element={<Logs />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Router>
          <div className="min-h-screen text-foreground">
            <AppRoutes />
          </div>
        </Router>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;