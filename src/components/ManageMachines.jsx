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
            alert('Error al guardar la máquina.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta máquina?')) {
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
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            <header className="bg-white px-6 pt-10 pb-8 border-b border-slate-100 rounded-b-[48px] shadow-sm flex items-center space-x-6 relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="p-4 bg-slate-50 text-slate-400 rounded-2xl active:scale-95 transition-all border border-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Empresa Central</p>
                    <h1 className="text-3xl font-black text-slate-900 leading-none">Máquinas</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-6 pt-8 pb-32 overflow-y-auto space-y-8">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        className="w-full bg-white border border-slate-200 rounded-[30px] py-5 pl-14 pr-6 text-slate-900 font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                        placeholder="Buscar máquina..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-3">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listado de Equipos</h2>
                        <div className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                            <span className="text-[10px] font-black uppercase text-blue-600">{filteredMachines.length} ACTIVAS</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-[40px] animate-pulse border border-slate-100"></div>)}
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {filteredMachines.map(machine => (
                                <div key={machine.id} className="bg-white p-6 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-5">
                                            <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <Coffee className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{machine.name}</h3>
                                                <p className="text-sm font-bold text-slate-400">{machine.location}</p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg shadow-blue-200">
                                            ${machine.price_per_cup}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-2 pt-5 border-t border-slate-50/50">
                                        <button
                                            onClick={() => { setSelectedMachineQR(machine); setIsQRModalOpen(true); }}
                                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl active:scale-95 transition-all hover:bg-slate-100"
                                        >
                                            <QrCode className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(machine)}
                                            className="p-4 bg-slate-50 text-blue-600 rounded-2xl active:scale-95 transition-all hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(machine.id)}
                                            className="p-4 bg-slate-50 text-red-500 rounded-2xl active:scale-95 transition-all hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 inset-x-0 p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40">
                <button
                    onClick={handleOpenAdd}
                    className="w-full bg-slate-900 text-white font-black py-7 rounded-[32px] shadow-2xl shadow-slate-900/40 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 text-lg tracking-tight"
                >
                    <Plus className="w-6 h-6" />
                    <span className="uppercase">AGREGAR MÁQUINA</span>
                </button>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white w-full max-w-sm rounded-[56px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingMachine ? 'Editar' : 'Nueva'}
                                </h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nombre del equipo</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-5 font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Master 3000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ubicación física</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-5 font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Ej: Sala de Juntas"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Precio ($)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-5 font-bold text-slate-900 outline-none focus:border-blue-500 transition-all text-center"
                                            value={formData.price_per_cup}
                                            onChange={(e) => setFormData({ ...formData, price_per_cup: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Modelo</label>
                                        <input
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-5 font-bold text-slate-900 outline-none focus:border-blue-500 transition-all text-center"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="MX-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={handleSave}
                                className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-xl active:scale-95 transition-all text-lg uppercase tracking-tight"
                            >
                                {editingMachine ? 'Guardar Cambios' : 'Registrar Equipo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {isQRModalOpen && selectedMachineQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-8">
                    <div className="bg-white w-full max-w-sm rounded-[60px] p-12 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="mb-10">
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{selectedMachineQR.name}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedMachineQR.location}</p>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-[48px] inline-block mb-10 border-2 border-slate-100 shadow-inner">
                            <QRCodeSVG
                                value={`vending-app://machine/${selectedMachineQR.id}`}
                                size={220}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <button
                            onClick={() => setIsQRModalOpen(false)}
                            className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] text-lg uppercase tracking-tight shadow-xl active:scale-95 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMachines;
