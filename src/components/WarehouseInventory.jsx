import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Plus,
    X,
    Barcode,
    Camera,
    CheckCircle2,
    RefreshCcw,
    Search,
    AlertCircle
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess }) => {
    const scannerId = "vending-qr-scanner-id";
    const scannerRef = useRef(null);

    useEffect(() => {
        const startScanner = async () => {
            try {
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode(scannerId);
                }

                await scannerRef.current.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        onScanSuccess(decodedText);
                    },
                    (() => { })
                );
            } catch (err) {
                console.warn("Scanner init error:", err);
            }
        };

        const timer = setTimeout(startScanner, 500);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    return <div id={scannerId} className="w-full h-full bg-black"></div>;
};

const WarehouseInventory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Entry Flow States
    const [showEntryFlow, setShowEntryFlow] = useState(false);
    const [scannedResult, setScannedResult] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        if (!user?.companyId) return;
        setLoading(true);
        setFetchError(null);
        try {
            const data = await inventoryService.getInventory(user.companyId);
            setInventory(data || []);
        } catch (err) {
            setFetchError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = async (barcode) => {
        setScannedResult({ barcode, name: 'Cargando...', quantity: 0 });
        try {
            const product = await inventoryService.getProductByBarcode(barcode);
            if (product) {
                setScannedResult(product);
            } else {
                setScannedResult({
                    barcode,
                    name: `Nuevo Producto`,
                    quantity: 0,
                    isNew: true
                });
            }
        } catch (err) {
            console.error("Scan error", err);
        }
    };

    const handleSaveEntry = async () => {
        if (!addAmount || isNaN(addAmount)) return;
        setIsSaving(true);
        try {
            await inventoryService.updateStock(
                scannedResult.isNew ? scannedResult.barcode : scannedResult.id,
                parseInt(addAmount),
                user.companyId
            );
            await loadInventory();
            setShowEntryFlow(false);
            setScannedResult(null);
            setAddAmount('');
        } catch (err) {
            alert("Error al guardar: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm))
    );

    if (showEntryFlow) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col font-sans animate-in fade-in duration-300">
                <header className="p-8 flex items-center justify-between">
                    <button
                        onClick={() => { setShowEntryFlow(false); setScannedResult(null); }}
                        className="p-4 bg-white/10 text-white rounded-2xl active:scale-95 transition-all outline-none"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Logistics Edge</h1>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Recepción de Mercancía</p>
                    </div>
                    <div className="w-14"></div>
                </header>

                <main className="flex-1 flex flex-col px-8 pb-32">
                    {!scannedResult ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                            <div className="aspect-square w-full max-w-sm bg-slate-800 rounded-[64px] overflow-hidden border-2 border-white/5 relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                                <QRScanner onScanSuccess={handleScanSuccess} />
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-4/5 h-4/5 border-2 border-blue-500/30 rounded-[48px] relative overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-line"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-4">
                                <p className="text-white text-lg font-black uppercase tracking-tight">Enfoca el código</p>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed">
                                    Alinea el código de barras dentro del recuadro para el registro automático
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto w-full space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="bg-white rounded-[48px] p-12 text-center space-y-8 shadow-2xl">
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-sm">
                                    <Package className="w-12 h-12" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none px-4">
                                        {scannedResult.name}
                                    </h2>
                                    <div className="flex items-center justify-center space-x-2">
                                        <Barcode className="w-4 h-4 text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">
                                            {scannedResult.barcode}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Ingreso Unidades</p>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    autoFocus
                                    className="w-full bg-slate-800 border-2 border-white/5 rounded-[40px] py-12 text-center text-7xl font-black text-white focus:border-blue-500 outline-none transition-all placeholder:text-white/5 shadow-inner"
                                    placeholder="0"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                />
                                <button
                                    onClick={() => setScannedResult(null)}
                                    className="w-full text-white/40 font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl hover:text-white transition-colors"
                                >
                                    Escanear otro producto
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="fixed bottom-0 inset-x-0 p-8 z-50">
                    <button
                        onClick={handleSaveEntry}
                        disabled={!scannedResult || !addAmount || isSaving}
                        className="w-full h-24 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded-[36px] shadow-2xl shadow-blue-900/40 flex items-center justify-center space-x-4 active:scale-95 transition-all text-xl tracking-tight"
                    >
                        {isSaving ? (
                            <RefreshCcw className="w-8 h-8 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="w-8 h-8" />
                                <span className="uppercase">Finalizar Carga</span>
                            </>
                        )}
                    </button>
                </footer>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes scan-line {
                        0% { top: 0; }
                        50% { top: 100%; }
                        100% { top: 0; }
                    }
                    .animate-scan-line {
                        animation: scan-line 3s linear infinite;
                    }
                `}} />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Control de Existencias</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kardex de <span className="text-blue-600">Almacén</span></h1>
                </div>
                <button
                    onClick={() => setShowEntryFlow(true)}
                    className="bg-slate-900 text-white px-8 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-4"
                >
                    <Plus className="w-5 h-5 text-blue-400" />
                    <span>Nueva Entrada</span>
                </button>
            </header>

            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                    className="w-full bg-white border border-slate-100 rounded-[32px] py-6 pl-16 pr-8 text-slate-900 font-black text-sm focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="Filtrar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center space-x-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Catálogo Operativo</h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {filteredInventory.length} SKUs
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 6].map(i => (
                            <div key={i} className="h-32 bg-white rounded-[40px] animate-pulse border border-slate-50 shadow-sm"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInventory.map(item => (
                            <div key={item.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 bg-slate-50 rounded-[24px] flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <Package className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-3xl font-black tracking-tighter ${item.quantity < 5 ? 'text-red-500' : 'text-slate-900'}`}>
                                                {item.quantity}
                                            </p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Unidades</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate leading-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none font-mono">
                                            SKU: {item.barcode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarehouseInventory;
