import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Coffee,
    MapPin,
    History,
    RefreshCcw,
    Save,
    CheckCircle2
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { machineService } from '../services/machineService';
import { historyService } from '../services/historyService';
import { useAuth } from '../context/AuthContext';

const MachineDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { user } = useAuth();
    const [machineData, setMachineData] = useState(null);

    const [formData, setFormData] = useState({
        lecturaActual: '',
        vasos: 0,
        cafe: 0,
        azucar: 0,
        paletinas: 0,
        crema: 0,
        chocolate: 0
    });

    useEffect(() => {
        const fetchMachine = async () => {
            const data = await machineService.getMachineById(id);
            setMachineData(data || {
                name: 'Cámara Desconectada',
                location: 'Ubicación Desconocida',
                status: 'inactive'
            });
        };
        fetchMachine();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lecturaActual' ? value : parseInt(value) || 0
        }));
    };

    const handleSave = async () => {
        if (!formData.lecturaActual) return alert('Ingresa la lectura actual');
        setIsSaving(true);
        try {
            const currentReading = parseInt(formData.lecturaActual);
            const lastReading = machineData?.last_reading || 0;
            const tazasVendidas = Math.max(0, currentReading - lastReading);
            const pricePerCup = machineData?.price_per_cup || 10;
            const totalSales = tazasVendidas * pricePerCup;

            await historyService.addVisit({
                machineId: id,
                lecturaAnterior: lastReading,
                lecturaActual: currentReading,
                tazasVendidas,
                totalSales,
                insumos: {
                    vasos: formData.vasos,
                    cafe: formData.cafe,
                    azucar: formData.azucar,
                    paletinas: formData.paletinas,
                    crema: formData.crema,
                    chocolate: formData.chocolate
                }
            }, machineData.company_id);

            await machineService.updateLastReading(id, currentReading);
            await inventoryService.deductStock(formData, machineData.company_id);

            setShowSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            alert('Error al guardar datos');
        } finally {
            setIsSaving(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                    <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">¡Éxito Total!</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Datos sincronizados con la nube</p>
            </div>
        );
    }

    if (!machineData) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-32">
            <header className="bg-slate-900 px-8 pt-12 pb-16 rounded-b-[60px] relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <div className="max-w-md mx-auto relative z-10 flex items-center space-x-6">
                    <button onClick={() => navigate('/ruta-chofer')} className="p-4 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-all text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Visita Técnica</p>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase truncate max-w-[200px]">{machineData.name}</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-md mx-auto w-full -mt-10 space-y-8 relative z-20">
                {/* Location Card */}
                <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{machineData.location}</p>
                </div>

                {/* Primary Metric */}
                <div className="bg-white p-8 rounded-[48px] shadow-xl border border-blue-100/50 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lectura Actual (Tazas)</p>
                        <Coffee className="w-4 h-4 text-blue-500" />
                    </div>
                    <input
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] p-8 text-5xl font-black text-center text-slate-900 focus:border-blue-500 outline-none transition-all placeholder:text-slate-100"
                        placeholder="000"
                        type="number"
                        inputMode="decimal"
                        value={formData.lecturaActual}
                        onChange={handleChange}
                        name="lecturaActual"
                    />
                </div>

                {/* Refill Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-4">Relleno de Insumos</h3>
                    <div className="bg-white rounded-[40px] shadow-lg border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: 'Vasos', name: 'vasos', unit: 'uds' },
                                { label: 'Café', name: 'cafe', unit: 'g' },
                                { label: 'Azúcar', name: 'azucar', unit: 'g' },
                                { label: 'Paletinas', name: 'paletinas', unit: 'uds' },
                                { label: 'Crema', name: 'crema', unit: 'g' },
                                { label: 'Chocolate', name: 'chocolate', unit: 'g' }
                            ].map(item => (
                                <div key={item.name} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{item.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, [item.name]: Math.max(0, p[item.name] - 10) }))}
                                            className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black active:scale-90 transition-all"
                                        > - </button>
                                        <span className="w-8 text-center font-black text-lg text-slate-900">{formData[item.name]}</span>
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, [item.name]: p[item.name] + 10 }))}
                                            className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black active:scale-90 transition-all"
                                        > + </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Action Button */}
            <div className="fixed bottom-0 inset-x-0 p-8 pt-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-40">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-7 rounded-[32px] shadow-3xl shadow-slate-950/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 disabled:bg-slate-300"
                >
                    {isSaving ? <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                        <>
                            <RefreshCcw className="w-5 h-5" />
                            <span>Sincronizar Visita</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MachineDetails;
