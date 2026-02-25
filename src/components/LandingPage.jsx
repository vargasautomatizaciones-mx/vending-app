import React, { useState, useEffect } from 'react';
import { Package, Truck, BarChart3, ChevronRight, LogOut, User as UserIcon, Settings as SettingsIcon, History, AlertTriangle, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout, settings } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        const fetchAlerts = async () => {
            if (user?.role === 'admin' || user?.role === 'superadmin') {
                const data = await historyService.getLowStockAlerts(user.companyId);
                setAlerts(data || []);
            }
        };
        fetchAlerts();
        return () => clearInterval(timer);
    }, [user]);

    const menuItems = [
        {
            title: 'Ruta Chofer',
            description: 'Escanear QR y surtir',
            icon: <Truck className="w-6 h-6" />,
            color: 'bg-blue-600',
            path: '/ruta-chofer'
        },
        {
            title: 'Inventario',
            description: 'Gestión de almacén',
            icon: <Package className="w-6 h-6" />,
            color: 'bg-indigo-600',
            path: '/inventario',
            role: 'admin'
        },
        {
            title: 'Reportes',
            description: 'Ventas y análisis',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-purple-600',
            path: '/reportes',
            role: 'admin'
        },
        {
            title: 'Máquinas',
            description: 'Gestión de flota',
            icon: <SettingsIcon className="w-6 h-6" />,
            color: 'bg-slate-700',
            path: '/gestion-maquinas',
            role: 'admin'
        },
        {
            title: 'Historial',
            description: 'Auditoría visitas',
            icon: <History className="w-6 h-6" />,
            color: 'bg-amber-600',
            path: '/historial',
            role: 'admin'
        },
        {
            title: 'Ajustes',
            description: 'Perfil negocio',
            icon: <UserIcon className="w-6 h-6" />,
            color: 'bg-slate-500',
            path: '/ajustes',
            role: 'admin'
        },
    ].filter(item => {
        if (!item.role) return true;
        if (user?.role === 'superadmin') return true;
        return item.role === user?.role;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-12">
            {/* Dark Premium Header */}
            <header className="bg-slate-900 text-white px-8 pt-10 pb-16 rounded-b-[60px] shadow-2xl relative overflow-hidden z-10 shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>

                <div className="flex justify-between items-start relative z-10 mb-8">
                    <div className="space-y-1">
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Logistics Core</p>
                        <h1 className="text-3xl font-black tracking-tight leading-none uppercase">
                            Hola, {user?.name.split(' ')[0]} <span className="inline-block animate-bounce">👋</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                            {currentTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-4 bg-white/5 border border-white/10 rounded-[24px] text-white active:scale-95 transition-all shadow-xl"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-3 relative z-10">
                    <div className="flex items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                        Hub Activo
                    </div>
                    {user?.role === 'superadmin' && (
                        <button
                            onClick={() => navigate('/super-admin')}
                            className="bg-blue-600/10 text-blue-400 border border-blue-600/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all"
                        >
                            Master UI
                        </button>
                    )}
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto -mt-10 space-y-10 relative z-20">
                {/* Critical Alerts */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && alerts.length > 0 && (
                    <section className="bg-white rounded-[48px] p-8 border-2 border-red-50 shadow-2xl shadow-red-900/10">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Alertas Críticas</h1>
                            </div>
                            <span className="bg-red-500 text-white w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg shadow-red-500/40">
                                {alerts.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {alerts.slice(0, 2).map((alert, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(`/machine/${alert.machineId}`)}
                                    className="w-full bg-slate-50 p-6 rounded-[32px] flex justify-between items-center active:scale-[0.98] transition-all text-left group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm truncate">{alert.machineName}</p>
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">Suministro insuficiente</p>
                                    </div>
                                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Main Action Grid */}
                <section className="space-y-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] pl-6 mb-2">Comandos Principales</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                className="group relative bg-white border border-slate-100 rounded-[48px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 active:scale-95 transition-all duration-300 overflow-hidden text-left"
                            >
                                <div className={`w-14 h-14 ${item.color} rounded-[24px] flex items-center justify-center text-white mb-6 shadow-xl group-hover:rotate-12 transition-transform`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{item.title}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.description}</p>

                                {/* Geometric flair */}
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                                    {React.cloneElement(item.icon, { className: 'w-20 h-20' })}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <footer className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <Coffee className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operadora</h4>
                                <h3 className="text-xl font-black leading-tight truncate">{settings?.businessName || 'Vending Analytics'}</h3>
                            </div>
                        </div>
                        <div className="h-px bg-white/5 w-full"></div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Master Console v2.0</p>
                    </div>
                    {/* Visual accents */}
                    <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-600/20 rounded-full blur-[60px]"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;
