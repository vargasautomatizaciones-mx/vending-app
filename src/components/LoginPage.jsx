import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Lock,
    User,
    ShieldCheck,
    Building2,
    ChevronRight,
    AlertCircle,
    Coffee
} from 'lucide-react';
import { companyService } from '../services/companyService';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        companyId: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuperAdmin, setShowSuperAdmin] = useState(false);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await companyService.getCompanies();
                setCompanies(data || []);
            } catch (err) {
                console.error("Error loading companies", err);
            }
        };
        fetchCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(
                credentials.username.trim(),
                credentials.password.trim(),
                showSuperAdmin ? 'master' : credentials.companyId
            );

            if (result.success) {
                if (showSuperAdmin) {
                    navigate('/super-admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200">
                {/* Header Section with clean background */}
                <div className="bg-slate-900 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
                        <Coffee className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Vending Logistics</h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {showSuperAdmin ? 'Panel Maestro de Control' : 'Sistema de Gestión de Flota'}
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center space-x-3 text-red-700 text-sm font-bold animate-in fade-in">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {!showSuperAdmin && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Empresa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        value={credentials.companyId}
                                        onChange={(e) => setCredentials({ ...credentials, companyId: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Empresa</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder={showSuperAdmin ? "Correo electrónico" : "admin o chofer1"}
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:bg-slate-400 disabled:shadow-none"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Ingresar al Sistema</span>
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => setShowSuperAdmin(!showSuperAdmin)}
                            className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{showSuperAdmin ? 'Volver a Login de Empresa' : 'Acceso SuperAdmin Maestro'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                        Powered by Antigravity OS &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
