import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Camera, RefreshCw, Hash, ChevronRight } from 'lucide-react';
import { machineService } from '../services/machineService';
import { useAuth } from '../context/AuthContext';

const QRScanner = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scannerError, setScannerError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [manualId, setManualId] = useState('');
    const [machines, setMachines] = useState([]);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        html5QrCodeRef.current = new Html5Qrcode("vending-qr-reader");

        const startScanner = async () => {
            try {
                setIsScanning(true);
                setScannerError(null);

                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    {
                        fps: 15,
                        qrbox: { width: 260, height: 260 }
                    },
                    (decodedText) => {
                        html5QrCodeRef.current.stop().then(() => {
                            let machineId = decodedText;
                            if (decodedText.startsWith('vending-app://machine/')) {
                                machineId = decodedText.split('/').pop();
                            }
                            navigate(`/machine/${machineId}`);
                        });
                    },
                    (() => { })
                );
            } catch (err) {
                setScannerError("Permisos de cámara denegados o hardware no detectado.");
                setIsScanning(false);
            }
        };

        const timer = setTimeout(startScanner, 400);

        return () => {
            clearTimeout(timer);
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(() => { });
            }
        };
    }, [navigate]);

    useEffect(() => {
        const fetchMachines = async () => {
            if (user?.companyId) {
                const data = await machineService.getMachines(user.companyId);
                setMachines(data || []);
            }
        };
        fetchMachines();
    }, [user]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId.trim()) navigate(`/machine/${manualId.trim()}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-xl mx-auto">
            {/* Context Header */}
            <header>
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Logistics Terminal</p>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Scanner de <span className="text-blue-600">Ruta</span></h1>
            </header>

            {/* Immersive Scanner View */}
            <section className="relative group">
                <div className="aspect-square bg-slate-900 rounded-[64px] overflow-hidden border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative">
                    <div id="vending-qr-reader" className="w-full h-full"></div>

                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-12">
                        <div className="w-full h-full border-2 border-white/5 rounded-[48px] relative overflow-hidden">
                            {/* Scanning Line Animation */}
                            <div className="absolute inset-x-0 h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-scan-speed opacity-60"></div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                        </div>
                    </div>

                    {scannerError && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mb-8">
                                <Camera className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Error de Cámara</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-10 max-w-xs">
                                No se pudo inicializar el hardware de captura. Verifica los permisos de tu navegador.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                            >
                                Reiniciar Terminal
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl border border-white/10 flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <span>Procesador Activo</span>
                </div>
            </section>

            {/* Manual ID Input */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center space-x-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Entrada Manual</h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <form onSubmit={handleManualSubmit} className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        className="w-full bg-white border border-slate-100 rounded-[32px] py-7 pl-16 pr-32 font-black text-xl text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-200"
                        placeholder="ID DE MÁQUINA"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                    />
                    <button className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-[24px] font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-200">
                        ABRIR
                    </button>
                </form>
            </div>

            {/* Quick Fleet Access */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Acceso Directo a Flota</h2>
                    <button onClick={() => navigate('/gestion-maquinas')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Ver Todas</button>
                </div>

                <div className="grid gap-3">
                    {machines.slice(0, 3).map(m => (
                        <button
                            key={m.id}
                            onClick={() => navigate(`/machine/${m.id}`)}
                            className="w-full flex items-center justify-between p-6 bg-white border border-slate-50 rounded-[32px] hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-100 active:scale-[0.98] transition-all group"
                        >
                            <div className="flex items-center space-x-5">
                                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                    <Coffee className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{m.name}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{m.id}</p>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan-speed {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scan-speed {
                    animation: scan-speed 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}} />
        </div>
    );
};

export default QRScanner;
