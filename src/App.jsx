import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import MasterData from './pages/MasterData';
import Report from './pages/Report';
import SelectMode from './pages/SelectMode';
import MechanicDashboard from './pages/MechanicDashboard';
import MechanicTicketDetail from './pages/MechanicTicketDetail';
import VerifyTicket from './pages/VerifyTicket';
import QueueList from './pages/QueueList';
import InvoiceDetail from './pages/InvoiceDetail';
import Settings from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuthStore();

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />; // or to a NotAuthorized page

  return children;
};

// Komponen pembantu untuk menjalankan hook secara global
const GlobalNotifications = () => {
  useRealtimeNotifications();
  return null;
};

function App() {
  const checkSession = useAuthStore(state => state.checkSession);

  useEffect(() => {
    const unsubscribe = checkSession();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [checkSession]);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      const { data } = await supabase.from('company_settings').select('company_name').single();
      if (data?.company_name) {
        document.title = data.company_name;
      }
    };
    fetchCompanySettings();
  }, []);

  return (
    <Router>
      <GlobalNotifications />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/select-mode" element={
            <ProtectedRoute allowedRoles={['mechanic', 'qc']}>
              <SelectMode />
            </ProtectedRoute>
          } />
          
          <Route path="/checklist" element={
            <ProtectedRoute allowedRoles={['mechanic', 'qc']}>
              <Checklist />
            </ProtectedRoute>
          } />

          <Route path="/mechanic-dashboard" element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicDashboard />
            </ProtectedRoute>
          } />

          <Route path="/mechanic/ticket/:id" element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicTicketDetail />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/queue" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <QueueList />
            </ProtectedRoute>
          } />

          <Route path="/verify/:id" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <VerifyTicket />
            </ProtectedRoute>
          } />

          <Route path="/master-data" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <MasterData />
            </ProtectedRoute>
          } />

          <Route path="/report" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <Report />
            </ProtectedRoute>
          } />

          <Route path="/report/:id" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <InvoiceDetail />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
