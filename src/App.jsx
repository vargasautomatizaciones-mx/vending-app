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
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
        <p className="text-slate-500">No tienes permisos para ver esta sección.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 text-blue-600 font-bold underline">Volver al inicio</button>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          } />
          <Route path="/ruta-chofer" element={
            <ProtectedRoute allowedRoles={['driver', 'admin']}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/machine/:id" element={
            <ProtectedRoute allowedRoles={['driver', 'admin']}>
              <MachineDetails />
            </ProtectedRoute>
          } />
          <Route path="/reportes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OwnerReports />
            </ProtectedRoute>
          } />
          <Route path="/inventario" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <WarehouseInventory />
            </ProtectedRoute>
          } />
          <Route path="/gestion-maquinas" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageMachines />
            </ProtectedRoute>
          } />
          <Route path="/historial" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VisitHistory />
            </ProtectedRoute>
          } />
          <Route path="/ajustes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
