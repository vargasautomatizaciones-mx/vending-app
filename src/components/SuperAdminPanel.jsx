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
    ArrowLeft
} from 'lucide-react';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';

const SuperAdminPanel = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', contact: '' });

    const fetchCompanies = async () => {
        const data = await companyService.getCompanies();
        setCompanies(data);
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
        if (newCompany.name) {
            await companyService.addCompany(newCompany);
            fetchCompanies();
            setIsCreateModalOpen(false);
            setNewCompany({ name: '', contact: '' });
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* SuperAdmin Header */}
            <header className="bg-slate-900 text-white p-6 shadow-xl sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black">Control Central (Master)</h1>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Panel de Super Administrador</p>
                        </div>
                    </div>
                    <button onClick={logout} className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5">
                        Cerrar Sesión Segura
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
                {/* Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Empresas</span>
                            <h3 className="text-2xl font-black text-slate-900">{companies.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                            <LineChart className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activas</span>
                            <h3 className="text-2xl font-black text-slate-900">{companies.filter(c => c.status === 'active').length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suspendidas</span>
                            <h3 className="text-2xl font-black text-slate-900">{companies.filter(c => c.status === 'suspended').length}</h3>
                        </div>
                    </div>
                </div>

                {/* Account List Controls */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <h2 className="text-xl font-black text-slate-900">Gestión de Cuentas</h2>
                        <div className="flex w-full sm:w-auto space-x-4">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full bg-slate-50 py-3 pl-10 pr-4 rounded-2xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Buscar empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nueva Empresa</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Sistema</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.map(company => (
                                    <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{company.name}</span>
                                                <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">{company.contact}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${company.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {company.status === 'active' ? 'Operativa' : 'Suspendida'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-slate-500">{company.id}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleStatusToggle(company.id, company.status)}
                                                    className={`p-3 rounded-xl border transition-all ${company.status === 'active'
                                                        ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    title={company.status === 'active' ? 'Suspender Acceso' : 'Activar Acceso'}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button className="p-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                                    <Settings className="w-4 h-4" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <form onSubmit={handleCreateCompany} className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Nueva Cuenta</h3>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre Comercial</label>
                                <input
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Ej: Snacks S.A."
                                    value={newCompany.name}
                                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Correo de Contacto</label>
                                <input
                                    type="email"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="admin@empresa.com"
                                    value={newCompany.contact}
                                    onChange={(e) => setNewCompany({ ...newCompany, contact: e.target.value })}
                                    required
                                />
                            </div>
                            <button className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl active:scale-95 transition-all mt-4">
                                Crear y Habilitar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SuperAdminPanel;
