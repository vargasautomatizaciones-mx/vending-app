import React, { useState, useEffect } from 'react';
import { Package, Truck, BarChart3, ChevronRight, LogOut, User as UserIcon, Settings as SettingsIcon, History, AlertTriangle, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            if (user?.role === 'admin' || user?.role === 'superadmin') {
                const data = await historyService.getLowStockAlerts(user.companyId);
                setAlerts(data || []);
            }
        };
        fetchAlerts();
    }, [user]);

    const kpis = user?.role === 'admin' || user?.role === 'superadmin' ? [
        { label: 'Ventas Hoy', value: '$2,450', change: '+12%', color: 'text-emerald-500' },
        { label: 'Máquinas Activas', value: '18/20', change: 'Estable', color: 'text-blue-500' },
        { label: 'Alertas Stock', value: alerts.length, change: alerts.length > 0 ? 'Revisión' : 'Ok', color: alerts.length > 0 ? 'text-red-500' : 'text-slate-400' }
    ] : [
        { label: 'Visitas Hoy', value: '4/6', change: '66% Completado', color: 'text-blue-500' },
        { label: 'Productividad', value: '98%', change: 'Excelente', color: 'text-emerald-500' },
        { label: 'Tiempo Promedio', value: '15m', change: 'Estable', color: 'text-slate-400' }
    ];

    const actions = [
        {
            id: 'inventario',
            path: '/inventario',
            icon: Package,
            label: user?.role === 'operator' ? 'Mi Carga' : 'Inventario',
            desc: user?.role === 'operator' ? 'Géstión de Stock' : 'Logística Almacén',
            color: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            activeColor: 'group-hover:bg-indigo-600',
            roles: ['admin', 'superadmin', 'operator']
        },
        {
            id: 'ruta',
            path: '/ruta-chofer',
            icon: Truck,
            label: 'Ruta Activa',
            desc: 'Surtido Táctico',
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            activeColor: 'group-hover:bg-emerald-600',
            roles: ['operator']
        },
        {
            id: 'maquinas',
            path: '/gestion-maquinas',
            icon: Coffee,
            label: 'Máquinas',
            desc: 'Gestión de Flota',
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            activeColor: 'group-hover:bg-blue-600',
            roles: ['admin', 'superadmin']
        },
        {
            id: 'reportes',
            path: '/reportes',
            icon: BarChart3,
            label: 'Análisis',
            desc: 'Métricas de Venta',
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
            activeColor: 'group-hover:bg-purple-600',
            roles: ['admin', 'superadmin']
        },
        {
            id: 'historial',
            path: '/historial',
            icon: History,
            label: 'Auditoría',
            desc: 'Historial de Visitas',
            color: 'bg-slate-50',
            iconColor: 'text-slate-600',
            activeColor: 'group-hover:bg-slate-900',
            roles: ['admin', 'superadmin', 'operator']
        }
    ];

    const filteredActions = actions.filter(a => a.roles.includes(user?.role));

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Executive Welcome */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">
                        {user?.role === 'operator' ? 'Terminal de Operador' : 'Panel de Control Ejecutivo'}
                    </p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Operación <span className="text-blue-600">{user?.role === 'operator' ? 'Logística' : 'Estratégica'}</span>
                    </h1>
                </div>
                <div className="hidden md:flex items-center space-x-3 bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Nominal</span>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{kpi.value}</h3>
                                <span className={`text-[9px] font-black uppercase tracking-tight bg-slate-50 px-3 py-1 rounded-full border border-slate-100 ${kpi.color}`}>
                                    {kpi.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Critical Alerts Card - Only for Admins */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && alerts.length > 0 && (
                <section className="bg-white rounded-[64px] p-12 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-50 rounded-full -mr-24 -mt-24 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center space-x-5">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center shadow-inner">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">Alertas de <span className="text-red-500">Stock</span></h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requerido en logística de campo</p>
                                </div>
                            </div>
                            <span className="bg-red-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-2xl shadow-red-200 uppercase tracking-[0.2em] self-start sm:self-center">
                                {alerts.length} Incidencias
                            </span>
                        </div>
                        <div className="grid gap-4">
                            {alerts.slice(0, 3).map((alert, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(`/machine/${alert.machineId}`)}
                                    className="w-full bg-slate-50/50 p-6 rounded-[36px] flex justify-between items-center group/item active:scale-[0.98] transition-all border border-transparent hover:border-slate-200 hover:bg-white"
                                >
                                    <div className="flex items-center space-x-5 min-w-0">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <Coffee className="w-6 h-6 text-slate-300 group-hover/item:text-blue-500 transition-colors" />
                                        </div>
                                        <div className="text-left min-w-0 space-y-1">
                                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm truncate">{alert.machineName}</p>
                                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">Prioridad Máxima</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover/item:bg-slate-900 group-hover/item:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Actions Grid */}
            <section className="space-y-8">
                <div className="flex items-center space-x-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Módulos de Operación</h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => navigate(action.path)}
                            className="bg-white p-8 rounded-[56px] shadow-sm border border-slate-100 text-left space-y-8 group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className={`w-16 h-16 ${action.color} ${action.iconColor} rounded-[28px] flex items-center justify-center ${action.activeColor} group-hover:text-white transition-all duration-500 shadow-sm relative z-10`}>
                                <action.icon className="w-8 h-8" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{action.label}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{action.desc}</p>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"></div>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
