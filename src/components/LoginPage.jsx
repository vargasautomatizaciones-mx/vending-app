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
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[28px] shadow-2xl shadow-blue-600/30 mb-6 rotate-3">
                        <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">VENDING<br />LOGISTICS</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        {showSuperAdmin ? 'Master Control Panel' : 'Fleet Management System'}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl p-1 rounded-[48px] border border-white/10 shadow-3xl">
                    <div className="bg-white rounded-[44px] p-8 sm:p-10 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center space-x-3 text-xs font-black uppercase tracking-tight animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {!showSuperAdmin && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Empresa</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <select
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-10 text-slate-900 font-bold focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
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
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Usuario</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                        placeholder={showSuperAdmin ? "Correo @master" : "admin / chofer"}
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Clave de Acceso</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:border-blue-500 outline-none transition-all font-mono placeholder:text-slate-100"
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
                                className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-2xl font-black shadow-xl shadow-slate-950/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:bg-slate-200 disabled:shadow-none uppercase tracking-tight text-lg"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>ACCEDER</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-6 border-t border-slate-50">
                            <button
                                onClick={() => setShowSuperAdmin(!showSuperAdmin)}
                                className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-blue-600 rounded-xl uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 bg-slate-50/50 hover:bg-blue-50"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>{showSuperAdmin ? 'Switch to Company' : 'Master Admin Access'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] opacity-50 italic">
                        Secured by Antigravity OS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
