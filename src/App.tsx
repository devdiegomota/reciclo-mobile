
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewDevice from './pages/NewDevice';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'user' }) => {
  const { user, role, loading } = useAuth(); // Assume hook handles logic

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
      <div className="animate-spin" style={{
        width: '40px',
        height: '40px',
        border: '4px solid var(--surface-color)',
        borderTop: '4px solid var(--primary-color)',
        borderRadius: '50%'
      }}></div>
    </div>
  );

  if (!user) return <Navigate to="/" />;

  // Admin access check (if requiredRole is admin)
  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/painel" />; // Redirect to user panel
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      {/* Global Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route path="/painel" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/painel/novo" element={
          <ProtectedRoute>
            <NewDevice />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
