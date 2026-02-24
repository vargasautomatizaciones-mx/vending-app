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

    const fetchVisits = async () => {
        if (user?.companyId) {
            const data = await historyService.getVisits(user.companyId);
            setVisits(data);
        }
    };

    useEffect(() => {
        fetchVisits();
    }, [user]);

    const handleExport = () => {
        historyService.exportToCSV(visits);
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-12">
            <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full mr-2 transition-colors text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">Historial de Visitas</h1>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-6">
                {/* Actions */}
                <button
                    onClick={handleExport}
                    disabled={visits.length === 0}
                    className="w-full bg-slate-900 text-white font-bold py-5 rounded-3xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                    <Download className="w-5 h-5" />
                    <span>Exportar a CSV (Excel)</span>
                </button>

                {/* Visit Timeline */}
                <section className="space-y-4">
                    <div className="px-1 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registros Recientes</h3>
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {visits.length} Visitas
                        </span>
                    </div>

                    <div className="relative space-y-4">
                        {visits.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-slate-100">
                                <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No hay visitas registradas aún.</p>
                            </div>
                        ) : (
                            visits.map((visit) => (
                                <div key={visit.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            <div className="p-3 bg-blue-50 rounded-2xl mr-4">
                                                <Coffee className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{visit.machineName}</h4>
                                                <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {visit.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center text-green-600 font-black">
                                                <span className="text-lg">${visit.totalSales?.toFixed(2) || '0.00'}</span>
                                                <ArrowUpRight className="w-4 h-4 ml-1" />
                                            </div>
                                            <span className="text-[10px] block text-slate-400 font-bold uppercase">Ingresos ($)</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase mb-3 bg-slate-50 py-1 px-3 rounded-full w-fit">
                                        Vendido: {visit.tazasVendidas} tazas (${(visit.totalSales / visit.tazasVendidas || 0).toFixed(2)}/u)
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50">
                                        <div className="text-center bg-slate-50 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Vasos</p>
                                            <p className="font-black text-slate-700">{visit.insumos.vasos}</p>
                                        </div>
                                        <div className="text-center bg-slate-50 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Café</p>
                                            <p className="font-black text-slate-700">{visit.insumos.cafe}g</p>
                                        </div>
                                        <div className="text-center bg-slate-50 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Azúcar</p>
                                            <p className="font-black text-slate-700">{visit.insumos.azucar}g</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VisitHistory;
