import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { EntryProvider } from './contexts/EntryContext';
import Toaster from './components/Toaster';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import EntryList from './pages/EntryList';
import EntryForm from './pages/EntryForm';
import Login from './pages/Login';
import Register from './pages/Register';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Content Component
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Dashboard />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries"
          element={
            <ProtectedRoute>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <EntryList />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries/new"
          element={
            <ProtectedRoute>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <EntryForm />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries/:id/edit"
          element={
            <ProtectedRoute>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <EntryForm />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ErrorDisplay />
      <Toaster />
    </div>
  );  
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <AuthProvider>
          <EntryProvider>
            <Router>
              <AppContent />
            </Router>
          </EntryProvider>
        </AuthProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}

export default App;
