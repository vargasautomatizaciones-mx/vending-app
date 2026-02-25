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
    const [machines, setMachines] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);
    const [selectedMachineQR, setSelectedMachineQR] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        model: '',
        price_per_cup: 15
    });

    const fetchMachines = async () => {
        if (user?.companyId) {
            const data = await machineService.getMachines(user.companyId);
            setMachines(data);
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
        <div className="min-h-screen bg-white font-sans pb-12">
            <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full mr-2 transition-colors text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">Gestión de Máquinas</h1>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar máquina..."
                        className="w-full bg-white border border-slate-200 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    {filteredMachines.map((machine) => (
                        <div key={machine.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="p-3 bg-slate-50 rounded-2xl mr-4 group-hover:bg-blue-50 transition-colors">
                                        <Coffee className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <p className="text-xs text-slate-500 font-medium mr-3">{machine.location}</p>
                                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
                                            ${machine.price_per_cup}/taza
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-100 px-2 py-1 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                    {machine.model}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-50">
                                <button
                                    onClick={() => { setSelectedMachineQR(machine); setIsQRModalOpen(true); }}
                                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                    title="Ver QR"
                                >
                                    <QrCode className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleOpenEdit(machine)}
                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    title="Editar"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(machine.id)}
                                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fixed Bottom Action Button */}
                <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-30">
                    <button
                        onClick={handleOpenAdd}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-6 h-6" />
                        <span>AGREGAR NUEVA MÁQUINA</span>
                    </button>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-2xl font-black text-slate-900">
                                {editingMachine ? 'Editar Máquina' : 'Nueva Máquina'}
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto pb-6 pr-2 -mr-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre</label>
                                <input
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/5 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Master 3000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Ubicación</label>
                                <input
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/5 outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Ej: Piso 2 - Sala juntas"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Precio por Taza ($)</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/5 outline-none"
                                    value={formData.price_per_cup}
                                    onChange={(e) => setFormData({ ...formData, price_per_cup: parseInt(e.target.value) || 0 })}
                                    placeholder="Ej: 15"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Modelo</label>
                                <input
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/5 outline-none"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="Ej: MX-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 shrink-0">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="bg-slate-100 text-slate-600 font-bold py-4 rounded-3xl active:scale-95 transition-all text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-slate-900 text-white font-bold py-4 rounded-3xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingMachine ? 'Guardar' : 'Registrar'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {isQRModalOpen && selectedMachineQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="mb-4">
                            <h3 className="text-2xl font-black text-slate-900">{selectedMachineQR.name}</h3>
                            <p className="text-sm text-slate-500">{selectedMachineQR.location}</p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[40px] inline-block mb-8 border-2 border-slate-100 shadow-inner">
                            <QRCodeSVG
                                value={`vending-app://machine/${selectedMachineQR.id}`}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">
                            ID: {selectedMachineQR.id}
                        </div>
                        <button
                            onClick={() => setIsQRModalOpen(false)}
                            className="w-full bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
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
