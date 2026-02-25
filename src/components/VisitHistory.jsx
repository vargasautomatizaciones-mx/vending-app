import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    History,
    Coffee,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { historyService } from '../services/historyService';
import { useAuth } from '../context/AuthContext';

const VisitHistory = () => {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchVisits = async () => {
            if (user?.companyId) {
                setLoading(true);
                try {
                    const data = await historyService.getVisits(user.companyId);
                    setVisits(data || []);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchVisits();
    }, [user]);

    const handleExport = () => {
        if (visits.length === 0) return;
        historyService.exportToCSV(visits);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Tactical Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Historical Integrity</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Registro de <span className="text-blue-600">Eventos</span></h1>
                </div>
                <button
                    onClick={handleExport}
                    disabled={visits.length === 0 || loading}
                    className="bg-white border border-slate-100 text-slate-900 px-8 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:bg-slate-900 hover:text-white active:scale-95 transition-all flex items-center justify-center space-x-4 group disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-900"
                >
                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    <span>Descargar Reporte Operativo</span>
                </button>
            </header>

            <div className="space-y-6">
                <div className="flex items-center space-x-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Auditoría de Movimientos</h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100 italic">
                        {visits.length} Entradas
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-[40px] animate-pulse border border-slate-50 shadow-sm"></div>
                        ))}
                    </div>
                ) : visits.length === 0 ? (
                    <div className="bg-white p-20 rounded-[64px] border border-dashed border-slate-200 text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto">
                            <History className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-slate-900 uppercase tracking-tight">Sin actividad histórica</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                Aún no se han registrado visitas técnicas o surtidos en la plataforma de su empresa.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {visits.map(v => (
                            <div key={v.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-white relative z-10">
                                                <Coffee className="w-8 h-8" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-white z-20">
                                                <ArrowUpRight className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-base leading-none group-hover:text-blue-600 transition-colors">
                                                {v.machineName}
                                            </h4>
                                            <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pt-1">
                                                <Calendar className="w-3 h-3 mr-2 text-blue-500" />
                                                {v.timestamp}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 flex-1 max-w-lg lg:border-x lg:border-slate-50 lg:px-10">
                                        {[
                                            { l: 'Cups', v: v.insumos.vasos, unit: 'u' },
                                            { l: 'Coffee', v: v.insumos.cafe, unit: 'g' },
                                            { l: 'Sugar', v: v.insumos.azucar, unit: 'g' }
                                        ].map((x, i) => (
                                            <div key={i} className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{x.l}</p>
                                                <div className="flex items-baseline space-x-1 font-black text-slate-900">
                                                    <span className="text-lg tracking-tighter">{x.v}</span>
                                                    <span className="text-[10px] uppercase text-slate-400">{x.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-1 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-3xl">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left lg:text-right">Recaudación</p>
                                            <p className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">
                                                <span className="text-lg opacity-50 mr-1">$</span>
                                                {v.totalSales?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitHistory;
