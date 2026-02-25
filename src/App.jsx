import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QRScanner from './components/QRScanner';
import MachineDetails from './components/MachineDetails';
import OwnerReports from './components/OwnerReports';
import WarehouseInventory from './components/WarehouseInventory';
import ManageMachines from './components/ManageMachines';
import VisitHistory from './components/VisitHistory';
import Settings from './components/Settings';
import LoginPage from './components/LoginPage';
import SuperAdminPanel from './components/SuperAdminPanel';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertTriangle } from 'lucide-react';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-12 text-center font-sans">
        <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mb-8">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Acceso Restringido</h2>
        <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm leading-relaxed mb-10 uppercase tracking-widest">
          Tu perfil maestro no cuenta con los permisos necesarios para este módulo.
        </p>
        <button
          onClick={() => window.location.href = '#/'}
          className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
        >
          Volver al Centro de Control
        </button>
      </div>
    );
  }

  return children;
};

// Simple auto-redirect hook/component to handle the initial landing
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) return <LoginPage />;
  if (user.role === 'superadmin') return <SuperAdminPanel />;

  return <LandingPage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardRedirect />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ruta-chofer" element={
            <ProtectedRoute allowedRoles={['operator', 'admin', 'superadmin']}>
              <MainLayout>
                <QRScanner />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/machine/:id" element={
            <ProtectedRoute allowedRoles={['operator', 'admin', 'superadmin']}>
              <MainLayout>
                <MachineDetails />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/reportes" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <MainLayout>
                <OwnerReports />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/inventario" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin', 'operator']}>
              <MainLayout>
                <WarehouseInventory />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/gestion-maquinas" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <MainLayout>
                <ManageMachines />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/historial" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin', 'operator']}>
              <MainLayout>
                <VisitHistory />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ajustes" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <MainLayout>
                <SuperAdminPanel />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
