import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    ShieldAlert,
    Plus,
    Power,
    Settings,
    LineChart,
    ChevronRight,
    Search,
    Building2,
    Calendar,
    ArrowLeft,
    X
} from 'lucide-react';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const SuperAdminPanel = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', contact: '' });
    const [loading, setLoading] = useState(false);

    const fetchCompanies = async () => {
        const data = await companyService.getCompanies();
        setCompanies(data || []);
    };

    useEffect(() => {
        if (user?.role !== 'superadmin') {
            navigate('/');
            return;
        }
        fetchCompanies();
    }, [user, navigate]);

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await companyService.updateCompanyStatus(id, newStatus);
        fetchCompanies();
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        if (!newCompany.name || !newCompany.contact) return;

        setLoading(true);
        try {
            const result = await companyService.addCompany(newCompany);
            if (result && result[0]) {
                const companyId = result[0].id;
                const tempPassword = 'admin' + Math.floor(1000 + Math.random() * 9000);
                await supabase.from('users').insert([{
                    email: newCompany.contact.trim().toLowerCase(),
                    password: tempPassword,
                    role: 'admin',
                    company_id: companyId,
                    name: `Admin ${newCompany.name}`
                }]);
                alert(`Empresa: ${newCompany.name}\nAdmin: ${newCompany.contact}\nPassword: ${tempPassword}`);
            }
            await fetchCompanies();
            setIsCreateModalOpen(false);
            setNewCompany({ name: '', contact: '' });
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
            <header className="bg-slate-900 text-white px-8 py-10 rounded-b-[60px] shadow-2xl relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate('/')} className="p-4 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Central Intelligence</p>
                            <h1 className="text-4xl font-black tracking-tight leading-none uppercase">Master Panel</h1>
                        </div>
                    </div>
                    <button onClick={logout} className="px-8 py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        Cerrar Sesión Maestro
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-8 -mt-8 space-y-10 relative z-20">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Empresas', val: companies.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Activas', val: companies.filter(c => c.status === 'active').length, icon: LineChart, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Suspendidas', val: companies.filter(c => c.status !== 'active').length, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center space-x-6">
                            <div className={`w-16 h-16 ${s.bg} ${s.color} rounded-[28px] flex items-center justify-center shadow-inner`}>
                                <s.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-3xl font-black text-slate-900">{s.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[56px] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] py-5 pl-14 pr-6 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="Filtrar por nombre o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[30px] font-black uppercase tracking-tight shadow-2xl shadow-blue-500/20 active:scale-95 transition-all text-sm flex items-center space-x-3"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Nueva Cuenta</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organización</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-10 py-8">
                                            <p className="font-black text-slate-900 text-xl tracking-tight uppercase">{c.name}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">{c.contact}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {c.status === 'active' ? 'Operativa' : 'Suspendida'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => handleStatusToggle(c.id, c.status)}
                                                    className={`p-4 rounded-2xl transition-all ${c.status === 'active' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
                                                >
                                                    <Power className="w-5 h-5" />
                                                </button>
                                                <button className="p-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl">
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Create Company Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-6">
                    <div className="bg-white w-full max-w-sm rounded-[60px] overflow-hidden shadow-3xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Nueva Empresa</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Razón Social</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                                        placeholder="Nombre de la empresa"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Correo contacto</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                                        placeholder="email@dominio.com"
                                        value={newCompany.contact}
                                        onChange={(e) => setNewCompany({ ...newCompany, contact: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-10 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={handleCreateCompany}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black py-7 rounded-[32px] text-lg uppercase tracking-tight shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center space-x-3"
                            >
                                {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>CREAR ORGANIZACIÓN</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminPanel;
