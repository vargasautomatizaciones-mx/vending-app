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
    const { user } = useAuth();

    useEffect(() => {
        const fetchVisits = async () => {
            if (user?.companyId) {
                const data = await historyService.getVisits(user.companyId);
                setVisits(data);
            }
        };
        fetchVisits();
    }, [user]);

    const handleExport = () => historyService.exportToCSV(visits);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
            <header className="bg-slate-900 text-white px-8 pt-12 pb-16 rounded-b-[60px] relative overflow-hidden z-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <div className="max-w-md mx-auto relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate('/')} className="p-4 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Registro Maestro</p>
                            <h1 className="text-3xl font-black tracking-tight uppercase">Historial</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto -mt-10 space-y-8 relative z-20">
                <button
                    onClick={handleExport}
                    disabled={visits.length === 0}
                    className="w-full bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-xl flex items-center justify-center space-x-4 active:scale-95 transition-all group disabled:opacity-50"
                >
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Download className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Exportar Datos (.CSV)</span>
                </button>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Registros Recientes</h3>
                        <div className="px-3 py-1 bg-slate-200 rounded-full text-[9px] font-black text-slate-600 uppercase">
                            {visits.length} Logs
                        </div>
                    </div>

                    <div className="space-y-4">
                        {visits.length === 0 ? (
                            <div className="bg-white p-12 rounded-[48px] border-2 border-dashed border-slate-100 text-center">
                                <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay actividad registrada</p>
                            </div>
                        ) : (
                            visits.map(v => (
                                <div key={v.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                <Coffee className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{v.machineName}</h4>
                                                <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {v.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end text-green-600 font-black text-lg">
                                                <span>${v.totalSales?.toFixed(2)}</span>
                                                <ArrowUpRight className="w-4 h-4 ml-1" />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingreso</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { l: 'Cup', v: v.insumos.vasos },
                                            { l: 'Coff', v: `${v.insumos.cafe}g` },
                                            { l: 'Sug', v: `${v.insumos.azucar}g` }
                                        ].map((x, i) => (
                                            <div key={i} className="bg-slate-50 p-4 rounded-2xl text-center">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{x.l}</p>
                                                <p className="font-black text-slate-900 text-xs">{x.v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VisitHistory;
