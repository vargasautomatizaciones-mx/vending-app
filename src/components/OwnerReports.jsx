import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BarChart3,
    TrendingUp,
    Package,
    Coffee,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';

const OwnerReports = () => {
    const navigate = useNavigate();

    const stats = [
        { label: 'Unidades Operativas', value: '12', change: 'En Línea', isUp: true, icon: Coffee, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Ventas del Periodo', value: '$14,580', change: '+12.4%', isUp: true, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Tasa de Conversión', value: '94.2%', change: '+3.1%', isUp: true, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    const machinePerformance = [
        { name: 'Coffee Alpha V1', location: 'Corporativo Piso 5', sales: 342, budget: 400, color: 'bg-blue-500' },
        { name: 'Brew Master 3000', location: 'Recepción Principal', sales: 289, budget: 350, color: 'bg-indigo-500' },
        { name: 'Latte Express MX', location: 'Club de Raqueta', sales: 156, budget: 200, color: 'bg-emerald-500' },
    ];

    const criticalInsumos = [
        { item: 'Grano Arábica', level: 12, status: 'Crítico', color: 'bg-red-500', note: 'Requerido en 24h' },
        { item: 'Vasos 8oz', level: 85, status: 'Óptimo', color: 'bg-emerald-500', note: 'Autosuficiente' },
        { item: 'Endulzante Stevia', level: 45, status: 'Alerta', color: 'bg-amber-500', note: 'Revisar stock' },
        { item: 'Paletinas Madera', level: 92, status: 'Óptimo', color: 'bg-emerald-500', note: 'Autosuficiente' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Executive Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Analytics Engine 2.0</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive <span className="text-blue-600">Overview</span></h1>
                </div>
                <div className="flex items-center space-x-2 bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm">
                    <Search className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo: Feb 2026</span>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        <div className="relative z-10 space-y-6">
                            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-[24px] flex items-center justify-center`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</h3>
                                    <div className={`flex items-center space-x-1 text-[10px] font-black ${s.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {s.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        <span>{s.change}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Fleet Performance Visualization */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-4 px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Red de Distribución</h2>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    <div className="bg-white p-10 rounded-[64px] border border-slate-100 shadow-sm space-y-10">
                        {machinePerformance.map((m, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{m.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900 leading-none">{m.sales}</p>
                                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Meta: {m.budget}</p>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className={`h-full ${m.color} rounded-full transition-all duration-1000 shadow-lg`}
                                        style={{ width: `${(m.sales / m.budget) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Logistics Risk Management */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-4 px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Logistics Risk Control</h2>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {criticalInsumos.map((x, i) => (
                            <div key={i} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm group hover:border-slate-300 transition-all flex flex-col justify-between h-40">
                                <div className="flex justify-between items-start">
                                    <div className={`w-3 h-3 ${x.color} rounded-full shadow-lg ${x.level < 20 ? 'animate-pulse' : ''}`}></div>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{x.status}</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{x.item}</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{x.level}%</p>
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 italic mt-2">{x.note}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OwnerReports;
