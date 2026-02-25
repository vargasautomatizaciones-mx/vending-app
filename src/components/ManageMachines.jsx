import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    QrCode,
    X,
    Save,
    Coffee,
    Search
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { machineService } from '../services/machineService';
import { useAuth } from '../context/AuthContext';

const ManageMachines = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [machines, setMachines] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);
    const [selectedMachineQR, setSelectedMachineQR] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        model: '',
        price_per_cup: 15
    });

    const fetchMachines = async () => {
        if (!user?.companyId) return;
        setLoading(true);
        try {
            const data = await machineService.getMachines(user.companyId);
            setMachines(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, [user]);

    const handleOpenAdd = () => {
        setEditingMachine(null);
        setFormData({ name: '', location: '', model: '', price_per_cup: 15 });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (machine) => {
        setEditingMachine(machine);
        setFormData({
            name: machine.name,
            location: machine.location,
            model: machine.model,
            price_per_cup: machine.price_per_cup || 15
        });
        setIsEditModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.location) return;
        try {
            if (editingMachine) {
                await machineService.updateMachine(editingMachine.id, formData);
            } else {
                await machineService.addMachine(formData, user.companyId);
            }
            await fetchMachines();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error saving machine:', error);
            alert('Error al guardar la máquina: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta máquina? Esta acción no se puede deshacer.')) {
            try {
                await machineService.deleteMachine(id);
                await fetchMachines();
            } catch (error) {
                console.error('Error deleting machine:', error);
                alert('Error al eliminar la máquina.');
            }
        }
    };

    const filteredMachines = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header / Actions */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Fleet Operations</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de <span className="text-blue-600">Activos</span></h1>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-slate-900 text-white px-8 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-4 group"
                >
                    <Plus className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform" />
                    <span>Registrar Nueva Unidad</span>
                </button>
            </header>

            {/* Search Filter */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                    className="w-full bg-white border border-slate-100 rounded-[32px] py-6 pl-16 pr-8 text-slate-900 font-black text-sm focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="Filtrar flota por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center space-x-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Directorio de Dispositivos</h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100 italic">
                        {filteredMachines.length} Unidades
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white rounded-[40px] animate-pulse border border-slate-50 shadow-sm"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMachines.map(machine => (
                            <div key={machine.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 bg-slate-50 rounded-[24px] flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <Coffee className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 tracking-tight">${machine.price_per_cup}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Precio/Copa</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate leading-tight">
                                            {machine.name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-3 h-3 text-slate-300" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate max-w-[140px]">
                                                {machine.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-6 relative z-10">
                                    <button
                                        onClick={() => { setSelectedMachineQR(machine); setIsQRModalOpen(true); }}
                                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-50 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                    >
                                        <QrCode className="w-3 h-3" />
                                        <span>QR</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(machine)}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(machine.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal / Glassmorphism */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[56px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
                        <div className="p-10 space-y-8 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Editor de Activos</p>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                                        {editingMachine ? 'Modificar' : 'Alta de Unidad'}
                                    </h3>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identificador Público</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-200"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: CAFETERA PREMIUM A-1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Referencia de Ubicación</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-200"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Ej: LOBBY PRINCIPAL"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tarifa ($)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-slate-900 outline-none focus:border-blue-500 transition-all text-center"
                                            value={formData.price_per_cup}
                                            onChange={(e) => setFormData({ ...formData, price_per_cup: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SKU Modelo</label>
                                        <input
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-slate-900 outline-none focus:border-blue-500 transition-all text-center placeholder:text-slate-200"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="SERIE-X"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={handleSave}
                                className="w-full h-20 bg-slate-900 text-white font-black rounded-[32px] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center space-x-3"
                            >
                                <Save className="w-5 h-5 text-blue-400" />
                                <span>{editingMachine ? 'Actualizar Registro' : 'Confirmar Alta'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal / Sophisticated Display */}
            {isQRModalOpen && selectedMachineQR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-2xl p-8 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[64px] p-12 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        <div className="mb-10 text-center space-y-1">
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedMachineQR.name}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] pt-1">Identificador Digital Único</p>
                        </div>
                        <div className="bg-white p-12 rounded-[56px] inline-block mb-10 border border-slate-50 shadow-2xl shadow-slate-200/50">
                            <QRCodeSVG
                                value={`vending-app://machine/${selectedMachineQR.id}`}
                                size={220}
                                level="H"
                                includeMargin={false}
                                fgColor="#0F172A"
                            />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic max-w-xs mx-auto">
                                Escanea este código con la terminal de operador para iniciar la visita técnica.
                            </p>
                            <button
                                onClick={() => setIsQRModalOpen(false)}
                                className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all border border-white/10"
                            >
                                Finalizar Vista
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMachines;
