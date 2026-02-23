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
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full mr-2 transition-colors text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-6">
                {showSuccess && (
                    <div className="bg-green-600 text-white p-4 rounded-2xl flex items-center shadow-lg animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        <span className="font-bold text-sm">Cambios guardados con éxito</span>
                    </div>
                )}

                <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Información Negocio</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter pl-1">Nombre Comercial</label>
                            <input
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/5 outline-none"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="Ej: Vending Logistics S.A."
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-slate-50">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Perfil Administrador</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter pl-1">Nombre para mostrar</label>
                            <input
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/5 outline-none"
                                value={formData.userName}
                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter pl-1">Nueva Contraseña (Dejar vacío para omitir)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="password"
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/5 outline-none"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-slate-900 text-white font-bold py-5 rounded-[28px] shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Guardar Ajustes</span>
                            </>
                        )}
                    </button>
                </section>
            </main>
        </div>
    );
};

export default Settings;
