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
        { label: 'Máquinas Activas', value: '12', icon: Coffee, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Tazas Vendidas', value: '1,458', change: '+12%', isUp: true, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Eficiencia', value: '94%', change: '+3%', isUp: true, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const machinePerformance = [
        { name: 'Coffee Alpha', location: 'Piso 5 Corporativo', sales: 342, progress: 85 },
        { name: 'Brew Bot 3000', location: 'Recepción', sales: 289, progress: 72 },
        { name: 'Latte Express', location: 'Comedor Central', sales: 156, progress: 40 },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
            <header className="bg-slate-900 text-white px-8 pt-10 pb-16 rounded-b-[60px] shadow-2xl relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/')} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Análisis Pro</p>
                            <h1 className="text-2xl font-black tracking-tight uppercase">Dashboard</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto -mt-10 space-y-8 relative z-20">
                {/* Metrics Horizontal Scroll */}
                <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 min-w-[200px] flex-none">
                            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <div className="flex items-end justify-between mt-1">
                                <h3 className="text-2xl font-black text-slate-900 leading-none">{s.value}</h3>
                                <span className={`text-[10px] font-black ${s.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                    {s.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Machine performance */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Rendimiento Semanal</h3>
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="bg-white rounded-[48px] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {machinePerformance.map((m, i) => (
                                <div key={i} className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{m.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 leading-none">{m.sales}</p>
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Tazas</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${m.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Estado de Insumos</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { item: 'Café', val: 'Low', color: 'bg-red-500' },
                            { item: 'Vasos', val: 'OK', color: 'bg-green-500' },
                            { item: 'Azúcar', val: 'OK', color: 'bg-blue-500' },
                            { item: 'Leche', val: 'Crit', color: 'bg-amber-500' }
                        ].map((x, i) => (
                            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-2 h-full ${x.color} opacity-20`}></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{x.item}</p>
                                <p className="text-xl font-black text-slate-900">{x.val}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OwnerReports;
