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

    // Mock data para reportes
    const stats = [
        { label: 'Máquinas Activas', value: '12', icon: Coffee, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Tazas Vendidas (Sem)', value: '1,458', change: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Consumo Insumos', value: '85%', change: '-2.1%', isUp: false, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const machinePerformance = [
        { name: 'Coffee Master Alpha', location: 'Corporativo Piso 5', sales: 342, progress: 85, trend: 'up' },
        { name: 'Brew Bot 3000', location: 'Recepción Central', sales: 289, progress: 72, trend: 'up' },
        { name: 'Latte Express', location: 'Comedor Planta 2', sales: 156, progress: 40, trend: 'down' },
        { name: 'Vending Pro X', location: 'Gimnasio Externo', sales: 124, progress: 32, trend: 'up' },
    ];

    const ingredientConsumption = [
        { item: 'Café de Grano', used: '12.5 kg', limit: '15.0 kg', status: 'normal' },
        { item: 'Vasos 8oz', used: '1,200 uds', limit: '2,000 uds', status: 'low' },
        { item: 'Azúcar Refinada', used: '5.2 kg', limit: '10.0 kg', status: 'normal' },
        { item: 'Leche en Polvo', used: '8.4 kg', limit: '12.0 kg', status: 'normal' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full mr-2 transition-colors text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">Reportes Dueño</h1>
                    </div>
                    <button className="p-2 bg-slate-100 rounded-full text-slate-600">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-8">
                {/* Dashboard Stats */}
                <section className="grid grid-cols-1 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`p-3 ${stat.bg} rounded-2xl mr-4`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                                </div>
                            </div>
                            {stat.change && (
                                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${stat.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {stat.change}
                                </div>
                            )}
                        </div>
                    ))} section
                </section>

                {/* Performance por Máquina */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rendimiento por Máquina</h3>
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="divide-y divide-slate-100">
                            {machinePerformance.map((machine, idx) => (
                                <div key={idx} className="p-5 flex flex-col space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{machine.name}</h4>
                                            <p className="text-xs text-slate-500">{machine.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-slate-900">{machine.sales}</span>
                                            <span className="text-[10px] block text-slate-400 font-bold uppercase">Tazas</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${machine.progress > 70 ? 'bg-blue-500' : machine.progress > 40 ? 'bg-indigo-400' : 'bg-slate-400'}`}
                                            style={{ width: `${machine.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Consumo de Insumos */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Consumo Semanal</h3>
                        <Package className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ingredientConsumption?.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                {item?.status === 'low' && (
                                    <div className="absolute top-0 right-0 p-1.5 bg-red-500 rounded-bl-xl">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item?.item}</p>
                                <p className="text-lg font-black text-slate-900">{item?.used}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-400">Meta: {item?.limit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OwnerReports;
