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
                name: 'Equipo No Encontrado',
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
            alert('Error al guardar datos: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const refillItems = [
        { label: 'Vasos', name: 'vasos', unit: 'uds', icon: Coffee },
        { label: 'Café', name: 'cafe', unit: 'g', icon: RefreshCcw },
        { label: 'Azúcar', name: 'azucar', unit: 'g', icon: RefreshCcw },
        { label: 'Paletinas', name: 'paletinas', unit: 'uds', icon: RefreshCcw },
        { label: 'Crema', name: 'crema', unit: 'g', icon: RefreshCcw },
        { label: 'Chocolate', name: 'chocolate', unit: 'g', icon: RefreshCcw }
    ];

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <div className="w-32 h-32 bg-emerald-50 rounded-[48px] flex items-center justify-center mb-10 relative">
                    <div className="absolute inset-0 bg-emerald-100 rounded-[48px] animate-ping opacity-20"></div>
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 relative z-10" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Sincronizado</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-[200px] mx-auto leading-relaxed">
                    La visita ha sido registrada exitosamente en el sistema central.
                </p>
            </div>
        );
    }

    if (!machineData) return (
        <div className="flex items-center justify-center h-full">
            <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-2xl mx-auto pb-32">
            {/* Header / Machine Identity */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Gestión de Unidad</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        {machineData.name.split(' ')[0]} <span className="text-blue-600">{machineData.name.split(' ').slice(1).join(' ')}</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-full border border-slate-100 shadow-sm">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{machineData.location}</span>
                </div>
            </header>

            {/* Primary Meter Input */}
            <section className="bg-white rounded-[56px] p-12 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-focus-within:bg-blue-100 transition-colors"></div>
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Contador de Ciclos</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingresa la lectura actual de la máquina</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Coffee className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[40px] py-12 text-7xl font-black text-center text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                            placeholder="0000"
                            type="number"
                            inputMode="decimal"
                            value={formData.lecturaActual}
                            onChange={handleChange}
                            name="lecturaActual"
                        />
                        <div className="absolute top-4 right-8 flex flex-col items-end opacity-40">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Lectura Previa</span>
                            <span className="text-xs font-black text-slate-900">{machineData.last_reading || 0}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Insumos Refill Grid */}
            <section className="space-y-6">
                <div className="flex items-center space-x-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Carga de Insumos</h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <div className="flex items-center space-x-2">
                        <Package className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Control Directo</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {refillItems.map(item => (
                        <div key={item.name} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                            <div className="space-y-1">
                                <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{item.label}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</p>
                            </div>
                            <div className="flex items-center bg-slate-50 rounded-3xl p-2 space-x-4">
                                <button
                                    onClick={() => setFormData(p => ({ ...p, [item.name]: Math.max(0, p[item.name] - 10) }))}
                                    className="w-10 h-10 rounded-2xl bg-white shadow-sm text-slate-400 flex items-center justify-center font-black hover:bg-slate-900 hover:text-white active:scale-90 transition-all"
                                > - </button>
                                <span className="w-6 text-center font-black text-sm text-slate-900">{formData[item.name]}</span>
                                <button
                                    onClick={() => setFormData(p => ({ ...p, [item.name]: p[item.name] + 10 }))}
                                    className="w-10 h-10 rounded-2xl bg-white shadow-sm text-blue-600 flex items-center justify-center font-black hover:bg-blue-600 hover:text-white active:scale-90 transition-all"
                                > + </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Executive Action Button */}
            <div className="pt-8">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-24 bg-slate-900 hover:bg-black text-white font-black rounded-[36px] shadow-2xl shadow-slate-200 flex items-center justify-center space-x-4 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] disabled:bg-slate-200 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10 flex items-center space-x-4">
                        {isSaving ? <RefreshCcw className="w-6 h-6 animate-spin" /> : (
                            <>
                                <Save className="w-5 h-5 text-blue-400" />
                                <span>Cerrar Reporte de Visita</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default MachineDetails;
