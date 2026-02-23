import React, { useState, useEffect } from 'react';
import { Package, Truck, BarChart3, ChevronRight, LogOut, User as UserIcon, Settings, History, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout, settings } = useAuth();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            if (user?.role === 'admin') {
                const data = await historyService.getLowStockAlerts(user.companyId);
                setAlerts(data);
            }
        };
        fetchAlerts();
    }, [user]);

    const menuItems = [
        {
            title: 'Inventario Almacén',
            description: 'Gestiona el stock central y pedidos de reposición.',
            icon: <Package className="w-8 h-8 text-blue-500" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            path: '/inventario'
        },
        {
            title: 'Ruta Chofer',
            description: 'Consulta tus máquinas asignadas y carga de hoy.',
            icon: <Truck className="w-8 h-8 text-green-500" />,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
            path: '/ruta-chofer'
        },
        {
            title: 'Reportes Dueño',
            description: 'Analiza ventas, rentabilidad y estado técnico.',
            icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100',
            path: '/reportes',
            role: 'admin'
        },
        {
            title: 'Gestión Máquinas',
            description: 'Administra la flota de máquinas y genera QRs.',
            icon: <Settings className="w-8 h-8 text-slate-500" />,
            bgColor: 'bg-slate-50',
            borderColor: 'border-slate-100',
            path: '/gestion-maquinas',
            role: 'admin'
        },
        {
            title: 'Historial de Visitas',
            description: 'Auditoría completa de recargas y ventas.',
            icon: <History className="w-8 h-8 text-orange-500" />,
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100',
            path: '/historial',
            role: 'admin'
        },
        {
            title: 'Ajustes App',
            description: 'Cambia tu contraseña y nombre de negocio.',
            icon: <Settings className="w-8 h-8 text-slate-400" />,
            bgColor: 'bg-white',
            borderColor: 'border-slate-100',
            path: '/ajustes',
            role: 'admin'
        },
    ].filter(item => !item.role || item.role === user?.role);

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <UserIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{user?.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{settings?.businessName || 'Vending Logistics'}</h1>
                </div>
                <button
                    onClick={logout}
                    className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 active:bg-slate-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            <main className="space-y-6 max-w-md mx-auto">
                {/* Critical Alerts Section (Admin Only) */}
                {user?.role === 'admin' && alerts.length > 0 && (
                    <section className="bg-red-50 border-2 border-red-100 rounded-[32px] p-6 mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-xl">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-sm font-black text-red-900 uppercase tracking-widest">Alertas de Stock Bajo</h2>
                        </div>
                        <div className="space-y-3">
                            {alerts.map((alert, idx) => (
                                <div key={idx} className="bg-white/60 p-3 rounded-2xl flex justify-between items-center text-xs">
                                    <div>
                                        <p className="font-bold text-slate-900">{alert.machineName}</p>
                                        <p className="text-red-600 font-medium">Bajo en: {alert.insumos.join(', ')}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/machine/${alert.machineId}`)}
                                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 transition-colors"
                                    >
                                        Atender
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center p-5 rounded-2xl border-2 ${item.borderColor} ${item.bgColor} shadow-sm active:scale-95 transition-all duration-200 text-left group`}
                    >
                        <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-slate-800">{item.title}</h2>
                            <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 ml-2" />
                    </button>
                ))}
            </main>

            <footer className="mt-12 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-xs text-slate-400 leading-none">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Sistema en línea</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
