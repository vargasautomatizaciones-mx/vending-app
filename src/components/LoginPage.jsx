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
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(
                credentials.username.trim(),
                credentials.password.trim()
            );

            if (result.success) {
                navigate('/');
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
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-[30px] shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500 cursor-default">
                        <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">VENDING <span className="text-blue-600">HUB</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Logistics Intelligence Platform</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 sm:p-12 space-y-10 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-5 rounded-[24px] flex items-center space-x-4 text-xs font-black uppercase tracking-tight border border-red-100 animate-in slide-in-from-top-4">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Identidad Maestra</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 pl-16 pr-8 text-slate-900 font-black focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-sm"
                                        placeholder="Admin / Operador"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Clave de Seguridad</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 pl-16 pr-8 text-slate-900 font-black focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-100 text-sm"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white py-7 rounded-[30px] font-black shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:bg-slate-200 disabled:shadow-none uppercase tracking-widest text-xs"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>INICIAR SESIÓN</span>
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer decoration in card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 -z-0"></div>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                        Vargas Automatizaciones ® 2026
                    </p>
                    <div className="h-1 w-12 bg-slate-200 mx-auto rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
