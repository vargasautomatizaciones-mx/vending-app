import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Building2,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user, settings, updateAdminProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        userName: user?.name || '',
        businessName: settings?.businessName || '',
        newPassword: ''
    });

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            updateAdminProfile(formData.userName, formData.newPassword, formData.businessName);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
            <header className="bg-slate-900 text-white px-8 pt-12 pb-16 rounded-b-[60px] shadow-2xl relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate('/')} className="p-4 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Configuración</p>
                            <h1 className="text-3xl font-black tracking-tight uppercase">Sistema</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto -mt-10 space-y-8 relative z-20">
                {showSuccess && (
                    <div className="bg-green-600 text-white p-6 rounded-[32px] flex items-center shadow-xl animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-6 h-6 mr-4" />
                        <span className="font-black text-xs uppercase tracking-widest">Ajustes actualizados correctamente</span>
                    </div>
                )}

                <div className="bg-white rounded-[48px] p-10 shadow-xl border border-slate-100 space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Negocio</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Entidad Corporativa</label>
                                <input
                                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-slate-900 focus:border-blue-500 outline-none transition-all"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    placeholder="Nombre de la empresa"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8 pt-10 border-t border-slate-50">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Administrador</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Alias Maestro</label>
                                <input
                                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-slate-900 focus:border-blue-500 outline-none transition-all"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="password"
                                        className="w-full p-6 pl-16 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-slate-900 focus:border-blue-500 outline-none transition-all"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-7 rounded-[32px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 disabled:bg-slate-300"
                    >
                        {isSaving ? <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Blindar Ajustes</span>
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Settings;
