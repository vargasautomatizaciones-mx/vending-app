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
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        html5QrCodeRef.current = new Html5Qrcode("reader");

        const startScanner = async () => {
            try {
                setIsScanning(true);
                setScannerError(null);

                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
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
                    (errorMessage) => { }
                );
            } catch (err) {
                setScannerError("Permisos de cámara denegados.");
                setIsScanning(false);
            }
        };

        startScanner();

        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(e => console.error(e));
            }
        };
    }, [navigate]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId.trim()) navigate(`/machine/${manualId.trim()}`);
    };

    const [machines, setMachines] = useState([]);

    useEffect(() => {
        const fetchMachines = async () => {
            if (user?.companyId) {
                const data = await machineService.getMachines(user.companyId);
                setMachines(data);
            }
        };
        fetchMachines();
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>

            <header className="px-6 py-8 flex items-center justify-between sticky top-0 z-30 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/')} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight">Escanear Ruta</h1>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{user?.name}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center justify-center space-y-12 pb-32">
                {/* Scanner Interface */}
                <div className="w-full max-w-sm relative">
                    <div className="aspect-square bg-black rounded-[48px] overflow-hidden border border-white/10 shadow-[0_0_80px_-20px_rgba(37,99,235,0.3)] relative">
                        <div id="reader" className="w-full h-full"></div>

                        {/* Custom Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-8 border-2 border-white/20 rounded-[32px]">
                                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                            </div>
                        </div>

                        {scannerError && (
                            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                                <Camera className="w-12 h-12 text-red-500 mb-4" />
                                <p className="font-bold text-slate-300 mb-6">{scannerError}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-xs uppercase"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Alinea el código QR</p>
                    </div>
                </div>

                {/* Manual Input Section */}
                <div className="w-full max-w-sm space-y-4">
                    <form onSubmit={handleManualSubmit} className="relative group">
                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-20 font-black text-lg focus:bg-white/10 focus:border-blue-500 transition-all outline-none"
                            placeholder="ID DE MÁQUINA"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                        />
                        <button className="absolute right-3 top-3 bottom-3 bg-blue-600 px-5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                            IR
                        </button>
                    </form>
                </div>

                {/* Quick Selection */}
                <div className="w-full max-w-sm">
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-2">Selección Rápida</p>
                        <div className="space-y-2">
                            {machines.slice(0, 3).map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => navigate(`/machine/${m.id}`)}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Coffee className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <span className="font-bold text-sm">{m.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QRScanner;
