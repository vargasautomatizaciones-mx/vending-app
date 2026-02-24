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

    // State para el formulario
    const [formData, setFormData] = useState({
        lecturaActual: '',
        vasos: 0,
        cafe: 0,
        azucar: 0,
        paletinas: 0,
        crema: 0,
        chocolate: 0
    });

    const [machineData, setMachineData] = useState(null);

    // Obtener datos reales de la máquina
    useEffect(() => {
        const fetchMachine = async () => {
            const data = await machineService.getMachineById(id);
            if (data) {
                setMachineData(data);
            } else {
                setMachineData({
                    name: 'Máquina Desconocida',
                    location: 'Ubicación no encontrada',
                    model: 'Generic-X',
                    status: 'inactive'
                });
            }
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
        if (!formData?.lecturaActual) {
            alert('Por favor, ingresa la Lectura Actual de tazas.');
            return;
        }

        setIsSaving(true);

        const currentReading = parseInt(formData.lecturaActual);
        const lastReading = machineData?.last_reading || 0;
        const tazasVendidas = Math.max(0, currentReading - lastReading);
        const pricePerCup = machineData?.price_per_cup || 10;
        const totalSales = tazasVendidas * pricePerCup;

        try {
            // Record visit in history
            await historyService.addVisit({
                machineId: id,
                lecturaAnterior: lastReading,
                lecturaActual: currentReading,
                tazasVendidas: tazasVendidas,
                totalSales: totalSales,
                insumos: {
                    vasos: formData?.vasos || 0,
                    cafe: formData?.cafe || 0,
                    azucar: formData?.azucar || 0,
                    paletinas: formData?.paletinas || 0,
                    crema: formData?.crema || 0,
                    chocolate: formData?.chocolate || 0
                }
            }, machineData.company_id);

            // Update machine reading
            await machineService.updateLastReading(id, currentReading);

            // Deduct from warehouse inventory
            await inventoryService.deductStock({
                vasos: formData.vasos,
                cafe: formData.cafe,
                azucar: formData.azucar,
                paletinas: formData.paletinas,
                crema: formData.crema,
                chocolate: formData.chocolate
            }, machineData.company_id);

            setIsSaving(false);
            setShowSuccess(true);

            // Regresamos al inicio después de mostrar éxito
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Error saving visit:', error);
            alert('Error al guardar la visita. Revisa tu conexión.');
            setIsSaving(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="bg-green-50 p-6 rounded-full mb-6">
                    <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">¡Visita Guardada!</h2>
                <p className="text-slate-500">Los datos han sido registrados correctamente en el sistema.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans pb-32">
            <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center">
                    <button onClick={() => navigate('/ruta-chofer')} className="p-2 hover:bg-slate-100 rounded-full mr-2 transition-colors text-slate-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Detalle de Máquina</h1>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center mb-6">
                        <div className="p-4 bg-blue-50 rounded-2xl mr-4">
                            <Coffee className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{machineData.name}</h2>
                            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md uppercase tracking-wider">Operativa</span>
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-slate-500 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        {machineData.location}
                    </div>
                </div>

                {/* Formulario Section */}
                <section className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Registro de Visita</h3>

                    <div className="space-y-4">
                        {/* Lectura Actual */}
                        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 focus-within:border-blue-500 transition-colors">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lectura Actual (Tazas)</label>
                            <input
                                type="number"
                                name="lecturaActual"
                                inputMode="decimal"
                                value={formData?.lecturaActual}
                                onChange={handleChange}
                                placeholder="000000"
                                className="w-full text-3xl font-black text-slate-900 focus:outline-none placeholder:text-slate-100"
                            />
                        </div>

                        {/* Insumos */}
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-500 uppercase">Insumos Rellenados</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {[
                                    { label: 'Vasos', name: 'vasos' },
                                    { label: 'Café (g)', name: 'cafe' },
                                    { label: 'Azúcar (g)', name: 'azucar' },
                                    { label: 'Paletinas', name: 'paletinas' },
                                    { label: 'Crema (g)', name: 'crema' },
                                    { label: 'Chocolate (g)', name: 'chocolate' },
                                ].map((item) => (
                                    <div key={item.name} className="flex items-center justify-between p-4 px-5">
                                        <label className="text-slate-700 font-medium">{item.label}</label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, [item.name]: Math.max(0, p[item.name] - 10) }))}
                                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 active:bg-slate-200"
                                            > - </button>
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                name={item.name}
                                                value={formData?.[item.name]}
                                                onChange={handleChange}
                                                className="w-12 text-center font-bold text-slate-900 focus:outline-none bg-transparent"
                                            />
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, [item.name]: p[item.name] + 10 }))}
                                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 active:bg-slate-200"
                                            > + </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full flex items-center justify-center space-x-2 bg-slate-900 text-white font-bold py-5 rounded-3xl shadow-xl active:scale-[0.98] transition-all disabled:bg-slate-400`}
                >
                    {isSaving ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>Guardar Visita</span>
                        </>
                    )}
                </button>
            </main>
        </div>
    );
};

export default MachineDetails;
