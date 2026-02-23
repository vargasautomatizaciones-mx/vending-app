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
                    (errorMessage) => {
                        // Suppress scanning noise
                    }
                );
            } catch (err) {
                console.error("Camera access failed", err);
                setScannerError("Permisos de cámara denegados o no detectada.");
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
        if (manualId.trim()) {
            navigate(`/machine/${manualId.trim()}`);
        }
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
        <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
            {/* Dark Header */}
            <header className="p-6 flex items-center shrink-0 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full mr-2 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold">Escáner de Ruta</h1>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user?.name}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-10">
                {/* Camera Container */}
                <div className="w-full max-w-sm mx-auto">
                    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-square border border-white/10 ring-8 ring-white/5">
                        <div id="reader" className="w-full h-full"></div>

                        {scannerError && (
                            <div className="absolute inset-0 bg-slate-800/95 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95">
                                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                                    <Camera className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Error de Cámara</h3>
                                <p className="text-sm text-slate-400 mb-8">{scannerError}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-white text-slate-900 px-6 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 active:scale-95 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Reintentar Acceso</span>
                                </button>
                            </div>
                        )}

                        {/* Scanner Overlay UI */}
                        {!scannerError && isScanning && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                                    <div className="absolute inset-0 border-4 border-blue-500 rounded-3xl animate-pulse"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Entry Fallback */}
                <div className="w-full max-w-sm mx-auto space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">O ingresa manual</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            inputMode="decimal"
                            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-5 pl-12 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-bold text-lg transition-all"
                            placeholder="ID de la máquina..."
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-blue-600 px-4 rounded-xl font-bold flex items-center justify-center active:bg-blue-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Debug / Development Quick Access */}
                <div className="w-full max-w-sm mx-auto pt-4">
                    <div className="bg-slate-800/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Acceso Rápido (Demo)</h4>
                        <div className="space-y-2">
                            {machines.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => navigate(`/machine/${m.id}`)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 group-hover:bg-blue-500/20">
                                            <Coffee className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-300">{m.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
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
