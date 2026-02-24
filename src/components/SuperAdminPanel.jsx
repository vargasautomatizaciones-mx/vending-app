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
        if (!newCompany.name || !newCompany.contact) return;

        setLoading(true);
        try {
            console.log("Iniciando creación de empresa:", newCompany);
            // 1. Create Company
            const result = await companyService.addCompany(newCompany);

            if (result && result[0]) {
                const companyId = result[0].id;
                console.log("Empresa creada con ID:", companyId);

                // 2. Create Initial Admin User for this company
                const tempPassword = 'admin' + Math.floor(1000 + Math.random() * 9000);
                const { error: userError } = await supabase.from('users').insert([{
                    email: newCompany.contact.trim().toLowerCase(),
                    password: tempPassword,
                    role: 'admin',
                    company_id: companyId,
                    name: `Administrador ${newCompany.name}`
                }]);

                if (userError) {
                    console.error("Error al crear usuario admin:", userError);
                    throw new Error("Empresa creada, pero falló la creación del usuario administrador.");
                }

                alert(`¡Éxito!\nEmpresa: ${newCompany.name}\nAdmin: ${newCompany.contact}\nPassword Temporal: ${tempPassword}`);
            }

            await fetchCompanies();
            setIsCreateModalOpen(false);
            setNewCompany({ name: '', contact: '' });
        } catch (error) {
            console.error("Error detallado en creación:", error);
            alert(`Error: ${error.message || 'Falló la conexión con la base de datos'}. \n\n¿Corriste los nuevos comandos SQL en Supabase?`);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
            {/* SuperAdmin Header */}
            <header className="bg-slate-900 text-white p-6 shadow-2xl sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black">Control Central (Master)</h1>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Panel de Gestión Maestro</p>
                        </div>
                    </div>
                    <button onClick={logout} className="bg-slate-800 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5 uppercase tracking-wider">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
                {/* Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex items-center space-x-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas</span>
                            <h3 className="text-2xl font-black text-slate-900">{companies.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex items-center space-x-6">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <LineChart className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activas</span>
                            <h3 className="text-2xl font-black text-slate-900">{companies.filter(c => c.status === 'active').length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex items-center space-x-6">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <ShieldAlert className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suspendidas</span>
                            <h3 className="text-2xl font-black text-slate-900">{companies.filter(c => c.status === 'suspended').length}</h3>
                        </div>
                    </div>
                </div>

                {/* Account List Controls */}
                <div className="bg-white rounded-[40px] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cuentas Registradas</h2>
                        <div className="flex w-full sm:w-auto space-x-4">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full bg-slate-50 py-3.5 pl-11 pr-4 rounded-2xl text-sm font-bold border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="Buscar empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center space-x-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-sm uppercase tracking-wider"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nueva Cuenta</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Empresa</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificador</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                            No hay empresas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompanies.map(company => (
                                        <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-lg tracking-tight">{company.name}</span>
                                                    <span className="text-[11px] text-blue-500 font-black uppercase tracking-widest mt-0.5">{company.contact || 'Sin contacto'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${company.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {company.status === 'active' ? 'Operativa' : 'Suspendida'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[11px] font-mono font-bold text-slate-400">{company.id}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleStatusToggle(company.id, company.status)}
                                                        className={`p-3 rounded-2xl border-2 transition-all shadow-sm ${company.status === 'active'
                                                            ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200'
                                                            : 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100 hover:border-green-200'
                                                            }`}
                                                        title={company.status === 'active' ? 'Suspender Acceso' : 'Activar Acceso'}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => alert('Configuración avanzada de empresa: Próximamente')}
                                                        className="p-3 bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-100 hover:border-slate-200 transition-all shadow-sm"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Create Company Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark, semi-opaque backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => !loading && setIsCreateModalOpen(false)}
                    />

                    {/* Modal Container: High Z-index, Solid White Background */}
                    <div className="relative z-[110] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <form
                            onSubmit={handleCreateCompany}
                            className="bg-white rounded-[48px] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Nueva Cuenta</h3>
                                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mt-1">Configuración Empresarial</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
                                >
                                    <Plus className="w-7 h-7 rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Nombre Comercial</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-inner"
                                            placeholder="Ej: Automatizaciones Vargas S.A."
                                            value={newCompany.name}
                                            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Correo de Contacto</label>
                                    <div className="relative">
                                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="email"
                                            className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-inner"
                                            placeholder="admin@vargasautomatizaciones.mx"
                                            value={newCompany.contact}
                                            onChange={(e) => setNewCompany({ ...newCompany, contact: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mt-4">
                                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider leading-relaxed text-center">
                                            Se creará un usuario administrador automáticamente para este correo con acceso completo.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] font-black shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:bg-slate-300 disabled:shadow-none mt-4 group"
                                >
                                    {loading ? (
                                        <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="text-sm uppercase tracking-[0.2em]">Crear y Habilitar</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminPanel;
