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
            const data = await companyService.getCompanies();
            setCompanies(data);
        };
        fetchCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(
                credentials.username,
                credentials.password,
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
            setError('Error al conectar con el sistema');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Visual background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

            <div className="w-full max-w-sm z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[30px] shadow-2xl shadow-blue-500/20 mb-6 rotate-12">
                        <Coffee className="w-10 h-10 text-white -rotate-12" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Vending Logistics</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        {showSuperAdmin ? 'Panel de Control Maestro' : 'Gestión de Flota Profesional'}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {!showSuperAdmin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">ID Empresa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                    <select
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                                        value={credentials.companyId}
                                        onChange={(e) => setCredentials({ ...credentials, companyId: e.target.value })}
                                        required
                                    >
                                        <option value="" className="bg-slate-900">-- Seleccionar --</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                <input
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    placeholder={showSuperAdmin ? "Master ID" : "admin o chofer1"}
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                <input
                                    type="password"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <button
                            onClick={() => setShowSuperAdmin(!showSuperAdmin)}
                            className="text-[10px] font-black text-slate-600 hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 mx-auto"
                        >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{showSuperAdmin ? 'Volver a Login de Empresa' : 'Acceso SuperAdmin'}</span>
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        Powered by Antigravity OS &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
